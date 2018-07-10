import React from 'react';

class Utils {
    static CapitalWords(name) {
        return (name || '').split(/[\s_]/)
            .filter(item => item)
            .map(word => word ? word[0].toUpperCase() + word.substring(1).toLowerCase() : '')
            .join(' ');
    }

    static getObjectName(objects, id, settings, isDesc) {
        let item = objects[id];
        let text = id;
        const attr = isDesc ? 'desc' : 'name';

        if (settings && settings.name) {
            text = settings.name;
            if (typeof text === 'object') {
                const lang = (objects['system.config'] && objects['system.config'].common && objects['system.config'].common.language) || 'en';
                text = text[lang] || text.en;
            }
        } else
        if (item && item.common && item.common[attr]) {
            text = item.common[attr];
            if (attr !== 'desc' && !text && item.common.desc) {
                text = item.common.desc;
            }
            if (typeof text === 'object') {
                const lang = (objects['system.config'] && objects['system.config'].common && objects['system.config'].common.language) || 'en';
                text = text[lang] || text.en;
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
            settings = settings.material && settings.material[options.user || 'admin'] ? JSON.parse(JSON.stringify(settings.material[options.user || 'admin'])) : {enabled: true};
        } else {
            settings = {enabled: defaultEnabling === undefined ? true : defaultEnabling, useCustom: false};
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
            obj.common.custom.material = obj.common.custom.material || {};
            obj.common.custom.material[options.user || 'admin'] = settings;
            const s = obj.common.custom.material[options.user || 'admin'];
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
        if (text !== text.toUpperCase()) {
            const words = [];
            let i = 0;
            let start = 0;
            while (i < text.length) {
                if (text[i].match(/[A-ZÜÄÖА-Я]/)) {
                    words.push(text.substring(start, i));
                    start = i;
                }
                i++;
            }
            if (start !== i) {
                words.push(text.substring(start, i));
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
}

export default Utils;