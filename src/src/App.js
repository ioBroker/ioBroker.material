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
import React, { Component } from 'react';
import {withStyles} from '@material-ui/core/styles';

import './App.css';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import RaisedButton from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import IconClose from 'react-icons/lib/md/close';
import IconSettings from 'react-icons/lib/md/mode-edit';
import IconEdit from 'react-icons/lib/md/settings';
import IconSignalOff from 'react-icons/lib/md/signal-wifi-off';
import IconLock from 'react-icons/lib/md/lock';
import IconFullScreen from 'react-icons/lib/md/fullscreen';
import IconFullScreenExit from 'react-icons/lib/md/fullscreen-exit';
import IconMic from 'react-icons/lib/md/mic';
import IconMenu from 'react-icons/lib/md/menu';
import IconRefresh from 'react-icons/lib/md/refresh';

import Theme from './theme';
import I18n from './i18n';
import VERSION from './version';
import Utils from './Utils';
import MenuList from './MenuList';
import StatesList from './StatesList';
import SpeechDialog from './SpeechDialog';
import DialogSettings from './States/SmartDialogSettings';
import LoadingIndicator from './basic-controls/react-loading-screen/LoadingIndicator';

const isKeyboardAvailableOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

const appConfigID = 'system.adapter.material.0';

const styles = () => (Theme.classes);

class App extends Component {
    // ensure ALLOW_KEYBOARD_INPUT is available and enabled

    static LOADING_TOTAL = 5;

    constructor(props) {
        super(props);

        let path = decodeURIComponent(window.location.hash).replace(/^#/, '');

        this.state = {
            menuFixed:      (typeof Storage !== 'undefined') ? window.localStorage.getItem('menuFixed') === '1' : false,
            open:           false,
            isListening:    false,
            loading:        true,
            loadingProgress: 0,
            loadingStep:    'loading...',
            connected:      false,
            refresh:        false,
            errorShow:      false,
            fullScreen:     false,
            editMode:       false,
            errorText:      '',
            masterPath:     path === Utils.INSTANCES ? 'instances' : (path ? 'enum.' + path.split('.').shift() : 'enum.rooms'),
            viewEnum:       path === Utils.INSTANCES ? 'instances' : (path ? 'enum.' + path : ''),
            width:          '0',
            height:         '0',
            backgroundId:   0,
            editEnumSettings: false,
            editAppSettings: false,
            settings:       null,
            appSettings:    null,
            actualVersion:  ''
        };
        this.state.open = this.state.menuFixed;

        this.objects = {};
        this.states = {};
        this.instances = null;
        this.tasks = [];
        this.user = 'admin';

        this.subscribeInstances = false;
        this.subscribes = {};
        this.requestStates = [];
        this.conn = window.servConn;
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.urlVersion = App.getUrlVersion();
    }

    static getUrlVersion() {
        let url = window.document.location.pathname;
        let m = url.match(/material\/(\d+\.\d+\.\d+)\//);
        return m && m[1];
    }

    showError(err) {
        this.setState({errorText: err, errorShow: true});
    }

    componentDidUpdate (prevProps, prevState) {
        //console.log(prevProps);
    }

    loadingStep(description) {
        this.setState({loadingProgress: this.state.loadingProgress + 1, loadingStep: description});
    }

    readInstancesData(readInstances, cb) {
        if (readInstances) {
            this.conn._socket.emit('getObjectView', 'system', 'instance', {
                    startkey: 'system.adapter.',
                    endkey: 'system.group.\u9999'
                },
                function (err, res) {
                    this.instances = {};
                    if (res && res.rows && res.rows.length) {
                        for (let i = 0; i < res.rows.length; i++) {
                            const obj = res.rows[i].value;
                            this.instances[obj._id] = obj;
                        }
                    }

                    cb();
                }.bind(this));
        } else {
            cb();
        }
    }

    readAllData() {
        this.loadingStep('read objects');
        this.user = this.conn.getUser().replace(/^system\.user\./, '');

        this.conn.getObject('system.adapter.material', function (err, obj) {
            obj && obj.common && obj.common.version && this.setState({actualVersion: obj.common.version});
        }.bind(this));

        this.conn.getObjects(!this.state.refresh, function (err, objects) {
            if (err) {
                this.showError(err);
            } else {
                let viewEnum = this.state.viewEnum;

                this.loadingStep('read config');
                this.conn.getObject(appConfigID, function (err, appConfig) {
                    this.loadingStep('read app config');
                    this.conn.getObject('system.config', function (err, config) {
                        objects['system.config'] = config;

                        I18n.setLanguage((config && config.common && config.common.language) || window.sysLang);

                        let keys = Object.keys(objects);
                        keys.sort();
                        let result = {};
                        for (let k = 0; k < keys.length; k++) {
                            if (keys[k].match(/^system\./) && keys[k] !== 'system.config') continue;
                            result[keys[k]] = {
                                common: objects[keys[k]].common,
                                type: objects[keys[k]].type
                            };
                        }
                        let appSettings = Utils.getSettings(appConfig || {_id: appConfigID}, {
                            user: this.user,
                            language: I18n.getLanguage()
                        });

                        // add loadingBackground & co
                        if (appConfig.native) {
                            appSettings = Object.assign(appSettings || {}, appConfig.native);
                        }

                        if (!viewEnum) {
                            viewEnum = appSettings.startEnum;
                        }
                        if (result && !viewEnum) {
                            let reg = new RegExp('^' + this.state.masterPath + '\\.');
                            // get first room
                            for (let id in result) {
                                if (result.hasOwnProperty(id) && reg.test(id)) {
                                    viewEnum = id;
                                    break;
                                }
                            }
                        }

                        this.objects = result || {};

                        this.readInstancesData(appSettings.instances, function () {
                            this.loadingStep('done');
                            if (viewEnum) {
                                this.setState({
                                    viewEnum: viewEnum,
                                    loading: false,
                                    settings: viewEnum === Utils.INSTANCES ?
                                        appSettings.instancesSettings || {}
                                        : Utils.getSettings((result || {})[viewEnum], {
                                        user: this.user,
                                        language: I18n.getLanguage()
                                    }),
                                    appSettings
                                });
                            } else {
                                this.setState({loading: false});
                            }

                            if (appSettings && (appSettings.text2command || appSettings.text2command === 0)) {
                                this.conn.subscribe(['text2command.' + appSettings.text2command + '.response']);
                            }

                            if (appSettings.instances) {
                                this.conn._socket.emit('subscribeObjects', 'system.adapter.*');
                                this.subscribeInstances = true;
                            } else if (this.subscribeInstances) {
                                this.conn._socket.emit('unsubscribeObjects', 'system.adapter.*');
                                this.subscribeInstances = false;
                            }
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }

    componentDidMount () {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.conn.namespace   = 'mobile.0';
        this.conn._useStorage = false;

        this.loadingStep('connecting');

        this.conn.init({
            name:          'mobile.0',  // optional - default 'vis.0'
            connLink:      (typeof socketUrl === 'undefined') ? '/' : undefined,  // optional URL of the socket.io adapter
//            socketSession: ''           // optional - used by authentication
        }, {
            onConnChange: function (isConnected) { // no lambda here
                if (isConnected) {
                    this.setState({connected: true, loading: true});
                    this.readAllData();
                } else {
                    this.setState({
                        connected: false,
                        loadingProgress: 1,
                        loading: true,
                        loadingStep: 'connecting'
                    });
                }
            }.bind(this),
            onRefresh: () => {
                window.location.reload();
            },
            onUpdate: function (id, state) { // no lambda here
                setTimeout(() => {
                    if (id) {
                        this.states[id] = state;
                    } else {
                        delete this.states[id];
                    }

                    if (this.subscribes[id]) {
                        this.subscribes[id].forEach(elem => elem.updateState(id, this.states[id]));
                    }

                    if (this.state.appSettings && (this.state.appSettings.text2command || this.state.appSettings.text2command === 0)) {
                        if (state && !state.ack && state.val && id === 'text2command.' + this.state.appSettings.text2command + '.response') {
                            this.speak(state.val);
                        }
                    }
                }, 0);
            }.bind(this),
            onError: function (err) { // no lambda here
                this.showError(err);
            }.bind(this),
            onObjectChange: function (id, obj) {
                if (this.instances) {
                    if (obj) {
                        this.instances[id] = obj;
                    } else if (this.instances[id]) {
                        delete this.instances[id];
                    }
                    this.forceUpdate();
                }
            }.bind(this)
        }, false, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.resizeTimer = null;
            this.setState({width: window.innerWidth, height: window.innerHeight});
        }, 200);
    }

    onToggleMenu () {
        if (this.state.menuFixed && typeof Storage !== 'undefined') {
            window.localStorage.setItem('menuFixed', '0');
        }
        this.setState({
            open: !this.state.open,
            menuFixed: false
        });
    }

    onToggleLock () {
        if (typeof Storage !== 'undefined') {
            window.localStorage.setItem('menuFixed', this.state.menuFixed ? '0': '1')
        }
        this.setState({menuFixed: !this.state.menuFixed});
    }

    static isFullScreenSupported() {
        let docElm = document.documentElement;
        return !!(docElm.requestFullScreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullscreen || docElm.msRequestFullscreen);
    }

    static controlFullScreen(isFullScreen) {
        if (isFullScreen) {
            let element = document.documentElement;
            if (element.requestFullScreen) {
                element.requestFullScreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                // Safari temporary fix
                if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
                    element.webkitRequestFullscreen();
                } else {
                    element.webkitRequestFullscreen(isKeyboardAvailableOnFullScreen);
                }
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    onToggleFullScreen () {
        App.controlFullScreen(!this.state.fullScreen);

        this.setState({fullScreen: !this.state.fullScreen});
    }

    onItemSelected(enumId, masterPath) {
        window.location.hash = encodeURIComponent(enumId.replace(/^enum\./, ''));

        const states = {
            viewEnum: enumId,
            open: this.state.menuFixed
        };
        if (masterPath !== undefined) {
            states.masterPath = masterPath;
        }
        if (enumId !== Utils.INSTANCES) {
            states.settings = Utils.getSettings(this.objects[enumId], {user: this.user, language: I18n.getLanguage()});
            if (this.subscribeInstances) {
                this.conn._socket.emit('unsubscribeObjects', 'system.adapter.*');
                this.subscribeInstances = false;
            }
            // load settings for this enum
            this.setState(states);
        } else {
            states.settings = (this.state.appSettings && this.state.appSettings.instancesSettings) || {};
            this.readInstancesData(true, () => {
                if (!this.subscribeInstances) {
                    this.conn._socket.emit('subscribeObjects', 'system.adapter.*');
                    this.subscribeInstances = true;
                }
                // load settings for this enum
                this.setState(states);
            });
        }
    }

    onRootChanged(root, page) {
        if (page) {
            this.onItemSelected(page, root);
        } else {
            this.setState({masterPath: root});
        }
    }

    updateIds(ids) {
        this.requestTimer = null;
        let _ids = this.requestStates;
        this.requestStates = [];

        this.conn.getStates(_ids, (err, states) => {
            Object.keys(states).forEach(id => {
                this.states[id] = states[id];
                if (!this.states[id]) delete this.states[id];

                if (this.subscribes[id]) {
                    this.subscribes[id].forEach(elem => elem.updateState(id, states[id]));
                }
            });
        });
    }

    /**
     *
     * @param {object} elem React visual element
     * @param {array} ids string or array of strings with IDs that must be subscribed or un-subscribed
     * @param {boolean} isMount true if subscribe and false if un-sibscribe
     */

    onCollectIds(elem, ids, isMount) {
        if (typeof ids !== 'object') {
            ids = [ids];
        }

        if (isMount) {
            let newIDs = [];
            let oldIDs = [];

            ids.forEach(id => {
                if (!this.subscribes[id]) {
                    newIDs.push(id);
                } else {
                    oldIDs.push({id, elem});
                }
                this.subscribes[id] = this.subscribes[id] || [];
                this.subscribes[id].push(elem);
            });
            if (newIDs.length) {
                this.conn.subscribe(newIDs);
                newIDs.forEach(id => {
                    if (this.requestStates.indexOf(id) === -1) {
                        this.requestStates.push(id);
                    }
                    if (this.requestTimer) {
                        clearTimeout(this.requestTimer);
                    }
                    this.requestTimer = setTimeout(() => {this.updateIds()}, 200);
                })
            }
            if (oldIDs.length) {
                setTimeout(() => {
                    oldIDs.forEach(item => {
                        if (this.states[item.id]) {
                            elem.updateState(item.id, this.states[item.id]);
                        }
                    });
                }, 0);
            }
        } else {
            let nonIDs = [];
            ids.forEach(id => {
                if (this.subscribes[id]) {
                    let pos = this.subscribes[id].indexOf(elem);
                    if (pos !== -1) {
                        this.subscribes[id].splice(pos, 1);
                    }

                    if (!this.subscribes[id].length) {
                        nonIDs.push(id);
                        delete this.subscribes[id];
                    }
                }
            });
            if (nonIDs.length) {
                this.conn.unsubscribe(nonIDs);
            }
        }
    }

    onControl(id, val, objectAttribute) {
        if (!id) {
            this.showError(I18n.t('Control ID is empty'));
        } else
        if (objectAttribute) {
            this.conn.getObject(id, (err, oldObj) => {
                // todo
                oldObj.common.enabled = val;
                this.conn._socket.emit('setObject', oldObj._id, oldObj, err => {
                    if (err) {
                        this.setState({errorText: err});
                    }
                });
            });
        } else {
            this.conn.setState(id, val);
        }
    }

    processTasks() {
        if (!this.tasks.length) {
            return;
        }

        const task = this.tasks[0];

        if (task.name === 'saveSettings') {
            this.conn.getObject(task.id, (err, obj) => {
                let settings = Utils.getSettings(obj, {user: this.user, language: I18n.getLanguage()}, task.defaultSettings && task.defaultSettings.enabled);
                if (JSON.stringify(settings) !== JSON.stringify(task.settings)) {
                    if (Utils.setSettings(obj, task.settings, {user: this.user, language: I18n.getLanguage()})) {
                        this.conn._socket.emit('setObject', obj._id, obj, err => {
                            if (!err) {
                                this.objects[obj._id] = obj;
                            }
                            if (typeof this.tasks[0].cb === 'function') {
                                this.tasks[0].cb();
                            }
                            this.tasks.shift();
                            if (err) console.error('Cannot save: ' + obj._id);
                            setTimeout(this.processTasks.bind(this), 0);
                        });
                    } else {
                        console.log('Invalid object: ' + task.id);
                        if (typeof this.tasks[0].cb === 'function') {
                            this.tasks[0].cb();
                        }
                        this.tasks.shift();
                        setTimeout(this.processTasks.bind(this), 0);
                    }
                } else {
                    if (typeof this.tasks[0].cb === 'function') {
                        this.tasks[0].cb();
                    }
                    this.tasks.shift();
                    setTimeout(this.processTasks.bind(this), 0);
                }
            });
        } else if (task.name === 'saveNativeSettings') {
            this.conn.getObject(task.id, (err, obj) => {
                if (JSON.stringify(obj.native) !== JSON.stringify(task.settings)) {
                    Object.assign(obj.native, task.settings);
                    this.conn._socket.emit('setObject', obj._id, obj, err => {
                        if (!err) {
                            this.objects[obj._id] = obj;
                        }
                        if (typeof this.tasks[0].cb === 'function') {
                            this.tasks[0].cb();
                        }
                        this.tasks.shift();
                        if (err) console.error('Cannot save: ' + obj._id);
                        setTimeout(this.processTasks.bind(this), 0);
                    });
                } else {
                    if (typeof this.tasks[0].cb === 'function') {
                        this.tasks[0].cb();
                    }
                    this.tasks.shift();
                    setTimeout(this.processTasks.bind(this), 0);
                }
            });
        } else {
            if (typeof this.tasks[0].cb === 'function') {
                this.tasks[0].cb();
            }
            this.tasks.shift();
            setTimeout(this.processTasks.bind(this), 0);
        }
    }

    onSaveSettings(id, settings, defaultSettings, cb) {
        if (typeof defaultSettings === 'function') {
            cb = defaultSettings;
            defaultSettings = {};
        }

        this.tasks.push({name: 'saveSettings', id, settings, defaultSettings, cb});

        if (this.tasks.length === 1) {
            this.processTasks();
        }
    }

    getTitle() {
        if (!this.state.viewEnum || !this.objects) {
            return (<span>ioBroker</span>);
        }

        if (this.state.viewEnum === Utils.INSTANCES) {
            return (<span>{I18n.t('Menu ' + Utils.INSTANCES)}</span>);
        }

        if (this.state.width < 500) {
            return (<span>{this.state.settings && this.state.settings.name}</span>);
        } else if (this.state.width < 1000) {
            return (<span>{Utils.getObjectName(this.objects, this.state.masterPath, null, {language: I18n.getLanguage()})} / {this.state.settings && this.state.settings.name}</span>);
        } else {
            return (<span>{Utils.getObjectName(this.objects, this.state.masterPath, null, {language: I18n.getLanguage()})} / {this.state.settings && this.state.settings.name}</span>);
        }
    }

    onSpeech(isStart) {
        this.setState({isListening: isStart});
    }

    onSpeechRec(text) {
        this.conn.setState('text2command.' + ((this.state.appSettings && this.state.appSettings.text2command) || 0) + '.text', text);
    }

    speak(text) {
        if (!window.SpeechSynthesisUtterance) {
            console.error('No support for speech synthesis on this platform!');
            return;
        }

        let voices = window.speechSynthesis.getVoices();
        if (!voices) {
            console.warn('No voices?');
            return;
        }
        let locale = this.getLocale();

        let utterance = new window.SpeechSynthesisUtterance(text);
        let voice = voices.find(voice => {
            return voice.lang === locale;
        });
        utterance.voice = voice;
        if (voice && voice.lang) {
            utterance.lang = voice.lang;
            window.speechSynthesis.speak(utterance);
        } else {
            console.log('No suitable language');
        }
    }

    getLocale() {
        let locale = 'de-DE';
        if (this.objects['system.config'] && this.objects['system.config'].common) {
            if (this.objects['system.config'].common.language === 'en') {
                locale = 'en-US';
            } else if (this.objects['system.config'].common.language === 'en') {
                locale = 'ru-RU';
            }
        }
        return locale;
    }

    toggleEditMode() {
        this.setState({editMode: !this.state.editMode});
    }

    editEnumSettingsOpen() {
        this.setState({editEnumSettings: true});
    }

    editEnumSettingsClose() {
        this.setState({editEnumSettings: false});
    }

    editAppSettingsOpen() {
        if (!this.state.appSettings || !this.state.appSettings.instances) {
            this.readInstancesData(true, () => {
                this.setState({editAppSettings: true});
            });
        } else {
            this.setState({editAppSettings: true});
        }
    }

    editAppSettingsClose() {
        this.setState({editAppSettings: false});
    }

    getDialogSettings() {
        const settings = [];

        if (this.state.viewEnum !== Utils.INSTANCES) {
            settings.unshift({
                name: 'icon',
                value: this.state.settings.icon || '',
                type: 'icon'
            });
        }
        settings.unshift({
            name: 'backgroundColor',
            label: 'Background color',
            value: this.state.settings.backgroundColor || '',
            type: 'color'
        });
        settings.unshift({
            name: 'background',
            value: this.state.settings.background || '',
            type: 'image'
        });
        settings.unshift({
            name: 'color',
            value: this.state.settings.color || '',
            type: 'color'
        });
        if (this.state.viewEnum !== Utils.INSTANCES) {
            settings.unshift({
                name: 'name',
                value: this.state.settings.name || '',
                type: 'string'
            });
            settings.unshift({
                name: 'newLine',
                value: this.state.settings.newLine || false,
                type: 'boolean'
            });
        }
        settings.unshift({
            name: 'align',
            value: this.state.settings.align || '',
            options: [
                {label: I18n.t('left'), value: 'left'},
                {label: I18n.t('center'), value: 'center'},
                {label: I18n.t('right'), value: 'right'}
            ],
            type: 'select'
        });

        return settings;
    }

    static isEnumUsed(result, id) {
        return !!result.find(opt => {
            if (opt.hasOwnProperty('children')) {
                return App.isEnumUsed(opt.children, id);
            } else {
                return opt.value === id;
            }
        })
    }

    getEnums(root, ids, settings) {
        const result = [];
        if (!root) {
            result.push({value: '', label: I18n.t('default')});
        }
        root = root || 'enum';
        settings = settings || {};

        let objects = this.objects;
        let reg       = root ? new RegExp('^' + root.replace(/\./g, '\\.') + '\\.') : new RegExp('^[^.]$');
        if (!ids) {
            const keys = Object.keys(objects);
            // keys.sort(); not required
            ids = keys.filter(id => objects.hasOwnProperty(id) && reg.test(id));
        }

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (!reg.test(id)) {
                continue;
            }

            if (!settings[id]) {
                settings[id] = Utils.getSettings(objects[id], {user: this.user, language: I18n.getLanguage()}, true);
            }

            if (settings[id].enabled === false || App.isEnumUsed(result, id)) {
                continue;
            }

            let subTree = this.getEnums(id, ids, settings);
            if (!subTree || !subTree.length) {
                result.push({label: settings[id].name, value: id});
            } else {
                result.push({label: settings[id].name, children: subTree});
            }
        }
        return result;
    }

    getAppSettings(settings) {
        settings = settings || [];
        const appSettings = this.state.appSettings || {};

        settings.push({
            name: 'instances',
            value: appSettings.instances === undefined ? true : appSettings.instances,
            type: 'boolean'
        });

        const text2command = Object.keys(this.instances)
            .filter(id => id.startsWith('system.adapter.text2command.'))
            .map(id => id.substring('system.adapter.text2command.'.length));
        text2command.unshift({label: I18n.t('disabled'), value: ''});

        settings.push({
            name: 'text2command',
            value: appSettings.text2command || text2command[0].value || '',
            options: text2command,
            type: 'select'
        });

        settings.push({
            name: 'menuBackground',
            value: appSettings.menuBackground || '',
            type: 'color'
        });

        settings.push({
            name: 'loadingBackground',
            value: appSettings.loadingBackground || '',
            type: 'color'
        });

        settings.push({
            name: 'ignoreIndicators',
            value: appSettings.ignoreIndicators === undefined ? 'UNREACH_ALARM,STICKY_UNREACH_ALARM,STICKY_UNREACH' : appSettings.ignoreIndicators,
            type: 'chips'
        });

        settings.push({
            name: 'startEnum',
            value: appSettings.startEnum || '',
            options: this.getEnums(),
            type: 'select'
        });

        settings.push({
            name: 'debug',
            value: appSettings.debug === undefined ? true : appSettings.debug ,
            type: 'boolean'
        });

        return settings;
    }

    readImageNames(cb) {
        const dir = `/${Utils.namespace}/${this.user}/`;
        this.conn.readDir(dir, (err, files) => {
            cb(files.map(file => dir + file.file));
        });
    }

    saveDialogSettings(settings) {
        settings = settings || this.state.settings;
        if (settings.background && typeof settings.background === 'object') {
            let fileName = `/${Utils.namespace}/${this.user}/${this.state.viewEnum}.${settings.background.ext}`;

            // upload image
            this.conn.writeFile64(fileName, settings.background.data, function (err) {
                if (err) {
                    window.alert(err);
                } else {
                    settings.background = fileName;
                    if (this.state.viewEnum === Utils.INSTANCES) {
                        const appSettings = JSON.parse(JSON.stringify(this.state.appSettings || {}));
                        appSettings.instancesSettings = settings;
                        this.setState({appSettings, settings, backgroundId: this.state.backgroundId + 1});
                        this.saveAppSettings(appSettings);
                    } else {
                        this.setState({settings, backgroundId: this.state.backgroundId + 1});
                        this.onSaveSettings(this.state.viewEnum, settings);
                    }
                }
            }.bind(this));
        } else {
            if (this.state.viewEnum === Utils.INSTANCES) {
                const appSettings = JSON.parse(JSON.stringify(this.state.appSettings || {}));
                appSettings.instancesSettings = settings;
                this.setState({appSettings, settings});
                this.saveAppSettings(appSettings);
            } else {
                this.setState({settings});
                this.onSaveSettings(this.state.viewEnum, settings);
            }
        }
    }

    saveAppSettings(appSettings) {
        appSettings = appSettings || this.state.appSettings || {};
        const nativeSettings = {
            loadingBackground: appSettings.loadingBackground
        };
        const _appSettings = JSON.parse(JSON.stringify(appSettings));
        delete _appSettings.loadingBackground;

        let tasks = 0;
        if (nativeSettings.loadingBackground !== undefined) {
            tasks++;
            this.tasks.push({name: 'saveNativeSettings', id: appConfigID, settings: nativeSettings});
        }
        tasks++;
        this.tasks.push({name: 'saveSettings', id: appConfigID, settings: _appSettings});
        this.setState({appSettings});

        if (this.tasks.length === tasks) {
            this.processTasks();
        }
    }

    onUpdateVersion() {
        const newLocation = this.urlVersion ? '../' + this.state.actualVersion + '/' : this.state.actualVersion + '/';
        console.log('redirect to ' + newLocation);
        if (!window.noServiceWorker && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
                setTimeout(() => document.location = newLocation, 500);
            });
        }
        setTimeout(() => document.location = newLocation, 2000);
    }

    getVersionControl() {
        if (!this.state.editMode) return null;
        if (this.state.actualVersion && (this.state.actualVersion !== VERSION || (this.urlVersion && this.state.actualVersion !== this.urlVersion))) {
            return (<Button onClick={() => this.onUpdateVersion()} variant="contained" size="small" title={I18n.t('Update to') + ' ' + this.state.actualVersion} color="secondary">
                <IconRefresh style={{marginRight: 5}}/> {parseFloat(this.state.width) > 500 ? I18n.t('Update to') + ' ' + this.state.actualVersion : ''}
            </Button>);
        } else {
            return (<span onClick={() => this.onUpdateVersion()}>{VERSION}</span>);
        }
    }

    getEditButton(useBright) {
        if (!this.state.connected) return null;

        let style;
        if (this.state.editMode) {
            style = {color: Theme.palette.editActive};
        } else if (this.state.actualVersion && (this.state.actualVersion !== VERSION || (this.urlVersion && this.state.actualVersion !== this.urlVersion))) {
            style = {color: Theme.palette.updateAvailable};
        } else {
            style = {color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark};
        }

        return (
            <IconButton
            onClick={this.toggleEditMode.bind(this)}
            style={style}>
                <IconEdit width={Theme.iconSize} height={Theme.iconSize}/>
            </IconButton>
        );
    }

    getMenu(useBright) {
        return (<Drawer
            variant={this.state.menuFixed ? 'permanent' : 'temporary'}
            open={this.state.open}
            onClose={() => this.setState({open: false})}
            classes={{paper: this.props.classes.menuBackground}}
            style={{
                width: Theme.menu.width,
                background: (this.state.appSettings && this.state.appSettings.menuBackground) || 'white'
            }}>
            <Toolbar style={this.state.appSettings && this.state.appSettings.menuBackground ? {background: this.state.appSettings.menuBackground} : {}}>
                <IconButton onClick={this.onToggleMenu.bind(this)} style={{color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}>
                    <IconClose width={Theme.iconSize} height={Theme.iconSize} />
                </IconButton>

                {this.state.connected && this.state.editMode ? (<IconButton onClick={this.editAppSettingsOpen.bind(this)} style={{color: this.state.editEnumSettings ? Theme.palette.editActive : (useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark)}}><IconSettings width={Theme.iconSize} height={Theme.iconSize}/></IconButton>) : null}

                <div style={{flex: 1}}/>

                {this.state.width > 500 && !this.state.menuFixed ?
                    (<IconButton onClick={this.onToggleLock.bind(this)} style={{float: 'right', color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}>
                        <IconLock width={Theme.iconSize} height={Theme.iconSize}/>
                    </IconButton>)
                    : null
                }
            </Toolbar>
            <MenuList
                width={Theme.menu.width}
                objects={this.objects}
                debug={this.state.appSettings ? (this.state.appSettings.debug === undefined ? true : this.state.appSettings.debug) : true}
                user={this.user}
                instances={this.state.appSettings && this.state.appSettings.instances}
                background={this.state.appSettings && this.state.appSettings.menuBackground}
                language={I18n.getLanguage()}
                viewEnum={this.state.viewEnum}
                editMode={this.state.editMode}
                root={this.state.masterPath}
                onSaveSettings={this.onSaveSettings.bind(this)}
                onRootChanged={this.onRootChanged.bind(this)}
                onSelectedItemChanged={this.onItemSelected.bind(this)}
            />
        </Drawer>);
    }

    getButtonFullScreen(useBright) {
        if (App.isFullScreenSupported()) {
            return (
                <IconButton
                    style={{color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}
                    onClick={this.onToggleFullScreen.bind(this)}>
                    {this.state.fullScreen ?
                        <IconFullScreenExit width={Theme.iconSize} height={Theme.iconSize} /> :
                        <IconFullScreen width={Theme.iconSize} height={Theme.iconSize} />
                    }
                </IconButton>);
        } else {
            return null;
        }
    }

    getButtonSpeech(useBright) {
        if (this.state.connected && this.state.appSettings &&
            (this.state.appSettings.text2command || this.state.appSettings.text2command === 0) &&
            SpeechDialog.isSpeechRecognitionSupported()) {
            return (
                <IconButton
                    style={{color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}
                    onClick={() => this.onSpeech(true)}>
                    <IconMic width={Theme.iconSize} height={Theme.iconSize}/>
                </IconButton>);
        } else {
            return null;
        }
    }

    getButtonEditSettings(useBright) {
        if (this.state.connected && this.state.editMode) {
            return (
                <IconButton
                    onClick={this.editEnumSettingsOpen.bind(this)}
                    style={{color: this.state.editEnumSettings ? Theme.palette.editActive : (useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark)}}>
                    <IconSettings width={Theme.iconSize} height={Theme.iconSize}/>
                </IconButton>);
        } else {
            return null;
        }
    }
    
    getButtonSignal(useBright) {
        if (this.state.connected) return null;
        return (
            <IconButton disabled={true} style={{color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}>
                <IconSignalOff width={Theme.iconSize} height={Theme.iconSize}/>
            </IconButton>
        );
    }

    getAppBar() {
        const toolbarBackground = this.state.settings ? this.state.settings.color : undefined;
        const useBright = !toolbarBackground || Utils.isUseBright(toolbarBackground);

        return (<AppBar
            position="fixed"
            style={{
                width: this.state.menuFixed ? 'calc(100% - ' +  Theme.menu.width + 'px)' : '100%',
                color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark,
                marginLeft: this.state.menuFixed ? Theme.menu.width : 0
            }}
        >
            <Toolbar style={{background: toolbarBackground, color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark}}>
                {!this.state.menuFixed &&
                (<IconButton color="inherit" aria-label="Menu" onClick={this.onToggleMenu.bind(this)} >
                    <IconMenu/>
                </IconButton>)}
                {Utils.getIcon(this.state.settings, Theme.appBarIcon)}
                <Typography variant="title" color="inherit" style={{flex: 1}}>
                    {this.getTitle()}
                </Typography>
                <div style={{color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark, whiteSpace: 'nowrap'}}>
                    {this.getVersionControl(useBright)}
                    {this.getButtonSignal(useBright)}
                    {this.getButtonEditSettings(useBright)}
                    {this.getEditButton(useBright)}
                    {this.getButtonSpeech(useBright)}
                    {this.getButtonFullScreen(useBright)}
                </div>
                {this.state.editEnumSettings ? (<DialogSettings key={'enum-settings'}
                                                                name={this.getTitle()}
                                                                windowWidth={parseFloat(this.state.width)}
                                                                getImages={this.readImageNames.bind(this)}
                                                                dialogKey={'enum-settings'}
                                                                settings={this.getDialogSettings()}
                                                                onSave={this.saveDialogSettings.bind(this)}
                                                                onClose={this.editEnumSettingsClose.bind(this)}

                />): null}
                {this.state.editAppSettings ? (<DialogSettings key={'app-settings'}
                                                               windowWidth={parseFloat(this.state.width)}
                                                               name={I18n.t('App settings')}
                                                               dialogKey={'app-settings'}
                                                               settings={this.getAppSettings()}
                                                               onSave={this.saveAppSettings.bind(this)}
                                                               onClose={this.editAppSettingsClose.bind(this)}

                />): null}
            </Toolbar>
        </AppBar>);
    }

    getStateList() {
        return (<StatesList
                objects={this.state.viewEnum === Utils.INSTANCES ? this.instances : this.objects}
                user={this.user}
                states={this.states}
                align={this.state.settings && this.state.settings.align}
                debug={this.state.appSettings ? (this.state.appSettings.debug === undefined ? true : this.state.appSettings.debug) : true}
                connected={this.state.connected}
                ignoreIndicators={((this.state.appSettings && this.state.appSettings.ignoreIndicators) || '').split(',')}
                backgroundColor={(this.state.settings && this.state.settings.backgroundColor) || ''}
                background={(this.state.settings && this.state.settings.background) || ''}
                backgroundId={this.state.backgroundId}
                newLine={this.state.settings && this.state.settings.newLine}
                editMode={this.state.editMode}
                windowWidth={parseFloat(this.state.width)}
                windowHeight={parseFloat(this.state.height)}
                marginLeft={this.state.menuFixed ? Theme.menu.width : 0}
                enumID={this.state.viewEnum}
                onSaveSettings={this.onSaveSettings.bind(this)}
                onControl={this.onControl.bind(this)}
                onCollectIds={this.onCollectIds.bind(this)}/>
        );
    }

    getErrorDialog() {
        return (<Dialog
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            onClose={() => this.setState({errorShow: false})}
            open={this.state.errorShow}
        >
            <DialogTitle id="alert-dialog-title">{I18n.t('Error')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {this.state.errorText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => this.setState({errorShow: false})} color="primary">OK</Button>
            </DialogActions>
        </Dialog>);
    }

    getSpeechDialog() {
        if (this.state.appSettings && (this.state.appSettings.text2command || this.state.appSettings.text2command === 0)) {
            return (SpeechDialog.isSpeechRecognitionSupported() ?
                <SpeechDialog
                    objects={this.objects}
                    isShow={this.state.isListening}
                    locale={this.getLocale()}
                    onSpeech={this.onSpeechRec.bind(this)}
                    onFinished={() => this.onSpeech(false)}
                /> : null);
        } else {
            return null;
        }
    }

    getLoadingScreen() {
        const background = window.materialBackground;
        const useBright = background && Utils.isUseBright(background);

        return (
            <div className={this.props.classes.loadingBackground} style={{background: window.materialBackground}}>
                <LoadingIndicator
                    color={useBright ? 'white' : 'black' }
                    value={100 * this.state.loadingProgress / App.LOADING_TOTAL}
                    label={I18n.t(this.state.loadingStep)}
                />
            </div>
        );
    }

    render() {
        if (this.state.loading) {
            return this.getLoadingScreen();
        } else {
            const useBright = this.state.appSettings && this.state.appSettings.menuBackground && Utils.isUseBright(this.state.appSettings.menuBackground);
            return (
                <div>
                    {this.getAppBar(useBright)}
                    {this.getMenu(useBright)}
                    {this.getStateList(useBright)}
                    {this.getErrorDialog(useBright)}
                    {this.getSpeechDialog(useBright)}
                </div>
            );
        }
    }
}

export default withStyles(styles)(App);
