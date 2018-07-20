/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react';

const NAMESPACE = 'material';

class Utils {
    static namespace = NAMESPACE;
    static INSTANCES = 'instances';

    static CapitalWords(name) {
        return (name || '').split(/[\s_]/)
            .filter(item => item)
            .map(word => word ? word[0].toUpperCase() + word.substring(1).toLowerCase() : '')
            .join(' ');
    }

    static getObjectName(objects, id, settings, options, isDesc) {
        let item = objects[id];
        let text = id;
        const attr = isDesc ? 'desc' : 'name';

        options = options || {};
        if (!options.language) {
            options.language = (objects['system.config'] && objects['system.config'].common && objects['system.config'].common.language) || window.sysLang || 'en';
        }
        if (settings && settings.name) {
            text = settings.name;
            if (typeof text === 'object') {
                text = text[options.language] || text.en;
            }
        } else
        if (item && item.common && item.common[attr]) {
            text = item.common[attr];
            if (attr !== 'desc' && !text && item.common.desc) {
                text = item.common.desc;
            }
            if (typeof text === 'object') {
                text = text[options.language] || text.en;
            }
            text = text.replace(/[_.]/g, ' ');

            if (text === text.toUpperCase()) {
                text = text[0] + text.substring(1).toLowerCase();
            }
        } else {
            let pos = id.lastIndexOf('.');
            text = id.substring(pos + 1).replace(/[_.]/g, ' ');
            text = Utils.CapitalWords(text);
        }
        return text.trim();
    }

    static getSettings(obj, options, defaultEnabling) {
        let settings;
        if (obj && obj.common && obj.common.custom) {
            settings = obj.common.custom || {};
            settings = settings[NAMESPACE] && settings[NAMESPACE][options.user || 'admin'] ? JSON.parse(JSON.stringify(settings[NAMESPACE][options.user || 'admin'])) : {enabled: true};
        } else {
            settings = {enabled: defaultEnabling === undefined ? true : defaultEnabling, useCustom: false, name: options.id && Utils.CapitalWords(options.id.split('.').pop())};
        }

        if (!settings.hasOwnProperty('enabled')) {
            settings.enabled = defaultEnabling === undefined ? true : defaultEnabling;
        }

        if (false && settings.useCommon) {
            if (obj.common.color) settings.color = obj.common.color;
            if (obj.common.icon)  settings.icon  = obj.common.icon;
            if (obj.common.name)  settings.name  = obj.common.name;
        } else {
            if (options) {
                if (!settings.name  && options.name)  settings.name  = options.name;
                if (!settings.icon  && options.icon)  settings.icon  = options.icon;
                if (!settings.color && options.color) settings.color = options.color;
            }

            if (obj && obj.common) {
                if (!settings.color && obj.common.color) settings.color = obj.common.color;
                if (!settings.icon  && obj.common.icon)  settings.icon  = obj.common.icon;
                if (!settings.name  && obj.common.name)  settings.name  = obj.common.name;
            }
        }

        if (typeof settings.name === 'object') {
            settings.name = settings.name[options.language] || settings.name.en;

            settings.name = (settings.name || '').replace(/_/g, ' ');

            if (settings.name === settings.name.toUpperCase()) {
                settings.name = settings.name[0] + settings.name.substring(1).toLowerCase();
            }
        }
        if (!settings.name && obj) {
            let pos = obj._id.lastIndexOf('.');
            settings.name = obj._id.substring(pos + 1).replace(/[_.]/g, ' ');
            settings.name = (settings.name || '').replace(/_/g, ' ');
            settings.name = Utils.CapitalWords(settings.name);
        }

        return settings;
    }

    static setSettings(obj, settings, options) {
        if (obj) {
            obj.common = obj.common || {};
            obj.common.custom = obj.common.custom || {};
            obj.common.custom[NAMESPACE] = obj.common.custom[NAMESPACE] || {};
            obj.common.custom[NAMESPACE][options.user || 'admin'] = settings;
            const s = obj.common.custom[NAMESPACE][options.user || 'admin'];
            if (s.useCommon) {
                if (s.color !== undefined) {
                    obj.common.color = s.color;
                    delete s.color;
                }
                if (s.icon !== undefined) {
                    obj.common.icon = s.icon;
                    delete s.icon;
                }
                if (s.name !== undefined) {
                    if (typeof obj.common.name !== 'object') {
                        obj.common.name = {};
                        obj.common.name[options.language] = s.name;
                    } else{
                        obj.common.name[options.language] = s.name;
                    }
                    delete s.name;
                }
            }

            return true;
        } else {
            return false;
        }
    }

    static getIcon(settings, style) {
        if (settings && settings.icon) {
            if (settings.icon.startsWith('data:image')) {
                return (<img alt={settings.name} src={settings.icon} style={style || {}}/>);
            } else { // may be later some changes for second type
                return (<img alt={settings.name} src={settings.icon} style={style || {}}/>);
            }
        }
        return null;
    }

    static splitCamelCase(text) {
        if (false && text !== text.toUpperCase()) {
            const words = text.split(/\s+/);
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (word.toLowerCase() !== word && word.toUpperCase() !== word) {
                    let z = 0;
                    const ww = [];
                    let start = 0;
                    while (z < word.length) {
                        if (word[z].match(/[A-ZÜÄÖА-Я]/)) {
                            ww.push(word.substring(start, z));
                            start = z;
                        }
                        z++;
                    }
                    if (start !== z) {
                        ww.push(word.substring(start, z));
                    }
                    for (let k = 0; k < ww.length; k++) {
                        words.splice(i + k, 0, ww[k]);
                    }
                    i += ww.length;
                }
            }

            return words.map(w => {
                w = w.trim();
                if (w) {
                    return w[0].toUpperCase() + w.substring(1).toLowerCase();
                }
                return '';
            }).join(' ');
        } else {
            return Utils.CapitalWords(text);
        }
    }

    // https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
    static invertColor(color) {
        if (color === null || color === undefined || color === '') {
            return true;
        }
        color = color.toString();
        if (color.indexOf('#') === 0) {
            color = color.slice(1);
        }
        let r;
        let g;
        let b;

        const rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        if (rgb && rgb.length === 4) {
            r = parseInt(rgb[1], 10);
            g = parseInt(rgb[2], 10);
            b = parseInt(rgb[3], 10);
        } else {
            // convert 3-digit hex to 6-digits.
            if (color.length === 3) {
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }
            if (color.length !== 6) {
                return false;
            }

            r = parseInt(color.slice(0, 2), 16);
            g = parseInt(color.slice(2, 4), 16);
            b = parseInt(color.slice(4, 6), 16);
        }


        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) <= 186;
    };

    static getTimeString(seconds) {
        seconds = parseFloat(seconds);
        if (isNaN(seconds)) {
            return '--:--';
        }
        const hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = seconds % 60;
        if (hours) {
            if (minutes < 10) minutes = '0' + minutes;
            if (secs < 10) secs = '0' + secs;
            return hours + ':' + minutes + ':' + seconds;
        } else {
            if (secs < 10) secs = '0' + secs;
            return minutes + ':' + secs;
        }
    }
}

export default Utils;