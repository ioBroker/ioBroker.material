/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
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
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import 'typeface-roboto'
import clsx from 'clsx';
import { withSnackbar } from 'notistack';

import './App.css';
import './helpers/stylesVariables.scss';
import cls from './style.module.scss';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Tooltip } from '@material-ui/core';

import { MdClose as IconClose } from 'react-icons/md';
import { MdCheck as IconCheck } from 'react-icons/md';
import { MdModeEdit as IconSettings } from 'react-icons/md';
import { MdSettings as IconEdit } from 'react-icons/md';
import { MdSignalWifiOff as IconSignalOff } from 'react-icons/md';
import { MdLock as IconLock } from 'react-icons/md';
import { MdFullscreen as IconFullScreen } from 'react-icons/md';
import { MdFullscreenExit as IconFullScreenExit } from 'react-icons/md';
import { MdMic as IconMic } from 'react-icons/md';
import { MdMenu as IconMenu } from 'react-icons/md';
import { MdRefresh as IconRefresh } from 'react-icons/md';
import { FaSignOutAlt as IconLogout } from 'react-icons/fa';
import { GiResize } from 'react-icons/gi';

import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import I18n from '@iobroker/adapter-react/i18n';
import Utils from '@iobroker/adapter-react/Components/Utils';
import GenericApp from '@iobroker/adapter-react/GenericApp';

import Theme from './theme';
import VERSION from './version';
import MenuList from './MenuList';
import StatesList from './StatesList/StatesList';
import SpeechDialog from './SpeechDialog';
import DialogSettings from './Dialogs/SmartDialogSettings';
import LoadingIndicator from './basic-controls/react-loading-screen/LoadingIndicator';
import ToggleThemeMenu from './Components/ToggleThemeMenu';

const isKeyboardAvailableOnFullScreen = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element && Element.ALLOW_KEYBOARD_INPUT;

const appConfigID = 'system.adapter.material.0';

const styles = () => (Theme.classes);

function getRandomInstance() {
    return Math.round(Math.random() * 10000);
}

function getUrlQuery() {
    const parts = (window.location.search || '').replace(/^\?/, '').split('&');
    const query = {};
    parts.forEach(item => {
        const [name, val] = item.split('=');
        query[decodeURIComponent(name)] = val !== undefined ? decodeURIComponent(val) : true;
    });
    return query;
}

class App extends GenericApp {
    // ensure ALLOW_KEYBOARD_INPUT is available and enabled

    static LOADING_TOTAL = 5;

    constructor(props) {
        const extendedProps = { ...props };
        extendedProps.bottomButtons = false;
        extendedProps.adapterName = 'devices';
        extendedProps.translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'zh-cn': require('./i18n/zh-cn'),
        };
        const query = getUrlQuery();

        if (query.port) {
            extendedProps.socket = {
                port: query.port,
                host: query.host || window.location.hostname,
            }
        }

        super(props, extendedProps);

        I18n.setLanguage((navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase());

        this.isApp = query.app;
        this.objects = {};
        this.allObjects = {};
        this.systemConfig = {};
        this.states = {};
        this.instances = null;
        this.tasks = [];
        this.user = 'admin';
        this.gotObjects = false;

        this.subscribeInstances = false;
        this.subscribes = {};
        this.requestStates = [];
        this.initialFullScreenMode = window.document.fullScreen || window.document.mozFullScreen || window.document.webkitIsFullScreen;
        this.isCloud = !!window.document.location.hostname.match(/^iobroker\./);

        window.addEventListener('pageshow', () => {
            if (this.gotObjects) {
                this.loadingStep('connecting');
            }
        }, false);

        this.urlVersion = App.getUrlVersion();
        this.socket.registerConnectionHandler(this.connectionHandler);
        window.alert = message => {
            if (message && message.toString().toLowerCase().includes('error')) {
                console.error(message);
                this.showAlert(message.toString(), 'error');
            } else {
                console.log(message);
                this.showAlert(message.toString(), 'info');
            }
        };

        this.browserInstance = window.localStorage.getItem('Material.instance');
        if (!this.browserInstance) {
            this.browserInstance = getRandomInstance();
            window.localStorage.setItem('Material.instance', this.browserInstance);
        }
    }

    showAlert = (message, status) => {
        this.props.enqueueSnackbar(message, { variant: status });
    }

    setStateAsync(state) {
        return new Promise(resolve => this.setState(state, () => resolve()));
    }

    componentDidMount() {
        super.componentDidMount();
        let path = GenericApp.getLocation()?.tab || '';
        const menuFixed = (typeof Storage !== 'undefined') ? window.localStorage.getItem('menuFixed') === '1' : false;
        const widthBlock = window.localStorage.getItem('Material.width') ? JSON.parse(window.localStorage.getItem('Material.width')) : false;

        const state = {
            menuFixed,
            open: menuFixed,
            isListening: false,
            loading: true,
            loadingProgress: 0,
            loadingStep: 'loading...',
            connected: false,
            refresh: false,
            errorShow: false,
            fullScreen: false,
            editMode: false,
            errorText: '',
            masterPath: path === Utils.INSTANCES ? 'instances' : (path ? 'enum.' + path.split('.').shift() : 'enum.rooms'),
            viewEnum: path === Utils.INSTANCES ? 'instances' : (path ? 'enum.' + path : ''),
            width: '0',
            height: '0',
            backgroundId: 0,
            editEnumSettings: false,
            editAppSettings: false,
            settings: null,
            appSettings: {},
            actualVersion: '',
            bigMessage: '',
            widthBlock
        };
        this.setState(state);
        document.getElementsByTagName('HTML')[0].className = `${this.state.themeName} ${widthBlock ? 'double' : 'single'}`;

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.loadLocalData(() =>
            this.loadingStep('connecting'));
    }

    connectionHandler = connected => {
        if (connected) {
            this.setState({ connected: true, loading: true });
            if (this.gotObjects) {
                this.resubscribe();
            } else {
                this.readAllData()
                    .catch(e => window.alert('Cannot read data: ' + e));
            }
        } else {
            this.subscribeInstances = false;
            this.setState({
                connected: false,
                loadingProgress: 1,
                loading: true,
                loadingStep: 'connecting'
            });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener('resize', this.updateWindowDimensions);
        //thema and page change
        this.socket.unsubscribeState('material.0.control.page', this.onPageChange);
        this.socket.unsubscribeState('material.0.control.theme', this.onThemaChange);
    }

    updateWindowDimensions = () => {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.resizeTimer = null;
            this.setState({ width: window.innerWidth, height: window.innerHeight });
        }, 200);
    }

    static getUrlVersion() {
        let url = window.document.location.pathname;
        let m = url.match(/material\/(\d+\.\d+\.\d+)\//);
        return m && m[1];
    }

    loadingStep(description) {
        this.setState({ loadingProgress: this.state.loadingProgress + 1, loadingStep: description });
    }

    loadingStepAsync(description) {
        return this.setStateAsync({ loadingProgress: this.state.loadingProgress + 1, loadingStep: description });
    }

    readInstancesData(readInstances) {
        if (readInstances) {
            return this.socket.getObjectView('system.adapter.', 'system.group.\u9999', 'instance')
                .then(instances => {
                    if (window.debugInstances) {
                        const rows = window.debugInstances;
                        for (let i = 0; i < rows.length; i++) {
                            const obj = rows[i].value;
                            this.instances[obj._id] = obj;
                        }
                    } else {
                        this.instances = instances;
                    }
                });
        } else {
            return Promise.resolve();
        }
    }

    setBarColor(settings) {
        const metas = window.document.getElementsByClassName('theme-color');
        if (metas) {
            for (let m = 0; m < metas.length; m++) {
                metas[m] && metas[m].setAttribute && metas[m].setAttribute('content', (settings || this.state.settings).background || Theme.palette.browserBar);
            }
        }
    }

    getObjects(useCache) {
        // If cache used
        if (this._useStorage && useCache) {
            if (this.storage) {
                const objects = this._objects || this.storage.get('objects');
                if (objects) {
                    return Promise.resolve(objects);
                }
            } else if (this._objects) {
                return Promise.resolve(this._objects);
            }
        }

        let enums;
        let data;

        return new Promise((resolve, reject) =>
            this.socket.getRawSocket().emit('getObjects', (err, data) => err ? reject(err) : resolve(data)))
            // Read all enums
            .then(_data => {
                data = _data;
                this.allObjects = JSON.parse(JSON.stringify(_data)) || {};
                return this.socket.getEnums();
            })
            .then(_enums => {
                Object.keys(_enums).forEach(id => data[id] = _enums[id]);
                enums = _enums;

                // Read all adapters for images
                return this.socket.getObjectView('system.adapter.', 'system.adapter.\u9999', 'instance');
            })
            .then(instances => {
                Object.keys(instances).forEach(id => data[id] = instances[id]);

                // find out default file mode
                if (data['system.adapter.' + this.namespace] &&
                    data['system.adapter.' + this.namespace].native &&
                    data['system.adapter.' + this.namespace].native.defaultFileMode) {
                    this._defaultMode = data['system.adapter.' + this.namespace].native.defaultFileMode;
                }
                // Read all channels for images
                return this.socket.getObjectView('', '\u9999', 'channel');
            })
            .then(channels => {
                Object.keys(channels).forEach(id => data[id] = channels[id]);
                // Read all devices for images
                return this.socket.getObjectView('', '\u9999', 'device');
            })
            .then(devices => {
                Object.keys(devices).forEach(id => data[id] = devices[id]);

                if (this._useStorage) {
                    this._fillChildren(data);
                    this._objects = data;
                    this._enums = enums;

                    if (this.storage) {
                        this.storage.set('objects', data);
                        this.storage.set('enums', enums);
                        this.storage.set('timeSync', Date.now());
                    }
                }

                return data;
            });
    }

    readRemoteData() {
        if (!this.state.refresh && this.localData) {
            this.localData.keys = Object.keys(this.localData.objects);
            this.localData.config = this.localData.objects['system.config'];

            this.localData.appSettings = Utils.getSettings(this.localData.appConfig || { _id: appConfigID }, {
                user: this.user,
                language: I18n.getLanguage()
            }) || {};

            this.localData.objects = this.localData.objects || {};
            this.localData.appConfig = this.localData.appConfig || { _id: appConfigID };
            this.localData.config = this.localData.config || {};
            this.localData.keys = this.localData.keys || [];

            const localData = this.localData;
            this.localData = null;
            return Promise.resolve(localData);
        } else {
            let result = {};
            let appConfig;
            let keys;
            return this.loadingStepAsync('read objects')
                .then(() => this.getObjects(false))
                .then(objects => {
                    this.loadingStep('read config');
                    objects = objects || {};
                    keys = Object.keys(objects);
                    keys.sort();

                    for (let k = 0; k < keys.length; k++) {
                        if (keys[k].match(/^system\./) && keys[k] !== 'system.config') {
                            continue;
                        }
                        result[keys[k]] = {
                            common: objects[keys[k]].common,
                            type: objects[keys[k]].type
                        };
                    }
                    return this.socket.getObject(appConfigID);
                })
                .then(_appConfig => {
                    appConfig = _appConfig;
                    this.loadingStep('read app config');
                    return this.socket.getSystemConfig();
                })
                .then(config => {
                    config = config || {};
                    this.systemConfig = JSON.parse(JSON.stringify(config)) || {};
                    result['system.config'] = config;
                    let appSettings = Utils.getSettings(appConfig || { _id: appConfigID }, {
                        user: this.user,
                        language: I18n.getLanguage()
                    }) || {};
                    if (!appSettings.noCache) {
                        try {
                            const myStorage = window.localStorage;
                            myStorage.setItem('data', JSON.stringify({ objects: result, appConfig }));
                        } catch (e) {
                            console.error('cannot store information to localstorage: ' + e);
                        }
                    }
                    appConfig = appConfig || {};

                    return { objects: result, appConfig, config, keys, appSettings };
                });
        }
    }

    onCommand = (id, state) => {
        if (this.state.appSettings && (this.state.appSettings.text2command || this.state.appSettings.text2command === 0)) {
            if (state && !state.ack && state.val && id === `text2command.${this.state.appSettings.text2command}.response`) {
                this.speak(state.val);
            }
        }
    };

    onStateChanged = (id, state) => {
        if (id) {
            this.states[id] = state;
        } else {
            delete this.states[id];
        }

        if (this.subscribes[id]) {
            this.subscribes[id].forEach(elem => elem.updateState(id, this.states[id]));
        }
    }

    onObjectChanged = (id, obj) => {
        if (this.instances) {
            if (obj) {
                this.instances[id] = obj;
            } else if (this.instances[id]) {
                delete this.instances[id];
            }
            this.forceUpdate();
        }
    }

    async readAllData() {
        try {
            await this.loadingStepAsync('read objects');
            this.user = (await this.socket.getCurrentUser()).replace(/^system\.user\./, '');
            this.auth = this.socket.isSecure;

            const obj = await this.socket.getObject('system.adapter.material');
            if (obj?.common?.version) {
                await this.setStateAsync({ actualVersion: obj.common.version });
            }

            const data = await this.readRemoteData();
            let objects = data.objects || {};
            if (typeof window.debugObjects !== 'undefined') {
                objects = window.debugObjects;
                window.debugEnums && window.debugEnums.rows.forEach(e => objects[e.id] = e.value);
                window.debugChannels && window.debugChannels.rows.forEach(e => objects[e.id] = e.value);
            }

            let viewEnum = this.state.viewEnum;

            I18n.setLanguage((data.config && data.config.common && data.config.common.language) || window.sysLang);
            let appSettings = data.appSettings;
            // add loadingBackground & co
            if (data.appConfig && data.appConfig.native) {
                appSettings = Object.assign(appSettings || {}, data.appConfig.native);
            }

            if (!viewEnum) {
                viewEnum = appSettings.startEnum;
            }
            if (objects && !viewEnum) {
                let reg = new RegExp('^' + this.state.masterPath + '\\.');
                // get first room
                viewEnum = Object.keys(objects).find(id => reg.test(id));
                if (!viewEnum) {
                    // show message please create at least one room in admin
                    return this.setState({
                        bigMessage: I18n.t('Please create some rooms in admin'),
                        loading: false,
                        settings: {}
                    });
                }
            }

            this.objects = objects || {};
            Utils.setDataFormat(this.getDateFormat());

            await this.readInstancesData(appSettings.instances);
            await this.loadingStepAsync('done');
            if (viewEnum) {
                const settings = viewEnum === Utils.INSTANCES ?
                    appSettings.instancesSettings || {}
                    : Utils.getSettings((objects || {})[viewEnum], {
                        user: this.user,
                        language: I18n.getLanguage()
                    });

                this.setState({
                    viewEnum,
                    loading: false,
                    settings,
                    appSettings
                });
                this.setBarColor(settings);
            } else {
                this.setState({ loading: false, settings: {} });
            }

            // sometimes text2command = {label: disabled}
            if (typeof appSettings.text2command === 'object') {
                appSettings.text2command = '';
            }

            if (appSettings && (appSettings.text2command || appSettings.text2command === 0)) {
                this.socket.subscribeState('text2command.' + appSettings.text2command + '.response', this.onCommand);
            }

            if (appSettings.instances) {
                this.socket.subscribeObject('system.adapter.*', this.onObjectChanged);
                this.subscribeInstances = true;
            } else if (this.subscribeInstances) {
                this.socket.unsubscribeObject('system.adapter.*', this.onObjectChanged);
                this.subscribeInstances = false;
            }
            this.statesPrefix = 'material.0.';
            //thema and page change
            this.socket.subscribeState(this.statesPrefix + 'control.page', this.onPageChange);
            this.socket.subscribeState(this.statesPrefix + 'control.theme', this.onThemaChange);

            this.gotObjects = true;
        } catch (err) {
            this.showError(err);
        }
    }


    checkLocation = (name, instance) => {
        const location = GenericApp.getLocation();

        if (name !== undefined) {
            if (typeof name === 'string' && /^[\],:{}\s]*$/.test(name.replace(/\\["\\\/bfnrtu]/g, '@').
                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                return this.checkLocation(JSON.parse(name));
            } else if (typeof name === 'string' && location?.tab !== name && (!instance || this.browserInstance === instance)) {
                return name;
            } else if (typeof name === 'object' && name?.page) {
                return this.checkLocation(name.page, name.instance);
            }
        }
        return null;
    }

    onPageChange = (id, state) => {
        if (id === this.statesPrefix + 'control.page' && state && !state.ack && state.val) {
            const loc = this.checkLocation(state.val);
            if (loc && state.val !== loc) {
                this.onItemSelected(`enum.${loc}`);
            }
        }
    }

    onThemaChange = (id, state) => {
        if (id === this.statesPrefix + 'control.theme' && state && !state.ack && state.val) {
            const loc = this.checkThemeName(state.val);
            if (loc && state.val !== loc) {
                this.toggleTheme(loc);
            }
        }
    }

    loadLocalData(callback) {
        let data = window.localStorage.getItem('data');
        if (data) {
            try {
                console.log(`Size of stored data: ${Math.floor(data.length / 1024)}k. Max possible: 5000k`);
                this.localData = JSON.parse(data);
            } catch (e) {
                console.error('cannot restore information from localstorage: ' + e);
            }
        }

        callback && callback();
    }

    onToggleMenu = () => {
        if (this.state.menuFixed && typeof Storage !== 'undefined') {
            window.localStorage.setItem('menuFixed', '0');
        }
        this.setState({
            open: !this.state.open,
            menuFixed: false
        });
    }

    onToggleLock = () => {
        if (typeof Storage !== 'undefined') {
            window.localStorage.setItem('menuFixed', this.state.menuFixed ? '0' : '1')
        }
        this.setState({ menuFixed: !this.state.menuFixed });
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

    onToggleFullScreen = () => {
        App.controlFullScreen(!this.state.fullScreen);

        this.setState({ fullScreen: !this.state.fullScreen });
    }

    onItemSelected = (enumId, masterPath, doNotCloseMenu) => {
        window.location.hash = encodeURIComponent(enumId.replace(/^enum\./, ''));

        this.socket.setState(this.statesPrefix + 'control.page', {
            val: JSON.stringify({
                page: enumId.replace(/^enum\./, ''),
                instance: this.browserInstance
            }), ack: true
        });

        const states = {
            viewEnum: enumId,
            open: doNotCloseMenu || this.state.menuFixed
        };
        if (masterPath !== undefined) {
            states.masterPath = masterPath;
        }
        if (enumId !== Utils.INSTANCES) {
            states.settings = Utils.getSettings(this.objects[enumId], { user: this.user, language: I18n.getLanguage() });
            if (this.subscribeInstances) {
                this.socket.unsubscribeObject('system.adapter.*', this.onObjectChanged);
                this.subscribeInstances = false;
            }
            this.setBarColor(states.settings);
            // load settings for this enum
            this.setState(states);
        } else {
            states.settings = (this.state.appSettings && this.state.appSettings.instancesSettings) || {};
            this.readInstancesData(true)
                .then(() => {
                    if (!this.subscribeInstances) {
                        this.socket.subscribeObject('system.adapter.*', this.onObjectChanged);
                        this.subscribeInstances = true;
                    }
                    // load settings for this enum
                    this.setState(states);
                });
        }
    }

    onRootChanged = (root, page, doNotCloseMenu) => {
        if (page) {
            this.onItemSelected(page, root, doNotCloseMenu);
        } else {
            this.setState({ masterPath: root });
        }
    }

    updateIds(ids) {
        this.requestTimer = null;
        ids = ids || this.requestStates;
        this.requestStates = [];

        this.socket.getForeignStates(ids)
            .then(states => {
                Object.keys(states).forEach(id => {
                    this.states[id] = states[id];
                    if (!this.states[id]) {
                        delete this.states[id];
                    }

                    if (this.subscribes[id]) {
                        this.subscribes[id].forEach(elem => elem.updateState(id, states[id]));
                    }
                });
            })
            .catch(e => {
                window.alert('Cannot read states: ' + e);
            });
    }

    resubscribe() {
        const ids = (this.subscribes && Object.keys(this.subscribes));
        if (this.state.appSettings.instances) {
            this.socket.subscribeObject('system.adapter.*', this.onObjectChanged);
            this.subscribeInstances = true;
        }
        if (ids && ids.length) {
            ids.forEach(id => this.socket.subscribeState(id, this.onStateChanged));
            if (this.requestTimer) {
                clearTimeout(this.requestTimer);
            }
            this.requestTimer = setTimeout(() => { this.updateIds(ids) }, 200);
        }
        this.loadingStep('done');
        this.setState({ loading: false });
    }

    /**
     *
     * @param {object} elem React visual element
     * @param {array} ids string or array of strings with IDs that must be subscribed or un-subscribed
     * @param {boolean} isMount true if subscribe and false if un-sibscribe
     */
    onCollectIds = (elem, ids, isMount) => {
        if (typeof ids !== 'object') {
            ids = [ids];
        }

        if (isMount) {
            let newIDs = [];
            let oldIDs = [];

            ids.forEach(id => {
                if (!id) {
                    console.warn('Invalid ID!');
                    return;
                }

                if (!this.subscribes[id]) {
                    newIDs.push(id);
                } else {
                    oldIDs.push({ id, elem });
                }
                this.subscribes[id] = this.subscribes[id] || [];
                this.subscribes[id].push(elem);
            });
            if (newIDs.length) {
                newIDs.forEach(id => this.socket.subscribeState(id, this.onStateChanged));

                newIDs.forEach(id => {
                    if (!this.requestStates.includes(id)) {
                        this.requestStates.push(id);
                    }
                });
                if (this.requestTimer) {
                    clearTimeout(this.requestTimer);
                    this.requestTimer = null;
                }
                if (this.requestStates.length) {
                    this.requestTimer = setTimeout(() => { this.updateIds() }, 200);
                }
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
                nonIDs.forEach(id => this.socket.unsubscribeState(id, this.onStateChanged));
            }
        }
    }

    onControl = (id, val, objectAttribute, callback = () => { }) => {
        if (!id) {
            this.showError(I18n.t('Control ID is empty'));
        } else
            if (objectAttribute) {
                this.socket.getObject(id)
                    .then(oldObj => {
                        // todo
                        oldObj.common.enabled = val;
                        this.socket.setObject(oldObj._id, oldObj)
                            .catch(err =>
                                this.showError(`Cannot control ${id}: ${err}`))
                    })
                    .catch(e => window.alert('Cannot get object: ' + e))
            } else {
                this.socket.setState(id, val)
                    .then(_ => callback())
                    .catch(e => {
                        callback();
                        window.alert('Cannot get object: ' + e);
                    })
            }
    }

    clearCachedObjects() {
        try {
            window.localStorage.removeItem('data');
        } catch (e) {
            console.error('Cannot clear local storage');
        }
    }

    processTasks = () => {
        if (!this.tasks.length) {
            return;
        }

        const task = this.tasks[0];

        if (task.name === 'saveSettings') {
            this.socket.getObject(task.id)
                .then(obj => {
                    let settings = Utils.getSettings(obj, { user: this.user, language: I18n.getLanguage() }, task.defaultSettings && task.defaultSettings.enabled);
                    if (JSON.stringify(settings) !== JSON.stringify(task.settings)) {
                        if (Utils.setSettings(obj, task.settings, { user: this.user, language: I18n.getLanguage() })) {
                            this.socket.setObject(obj._id, obj)
                                .then(() => {
                                    this.objects[obj._id] = obj;
                                    return true;
                                })
                                .catch(err => {
                                    console.error('Cannot save: ' + obj._id);
                                    this.showError(`Cannot save ${obj._id}: ${err}`);
                                    return false;
                                })
                                .then(result => {
                                    if (typeof this.tasks[0].cb === 'function') {
                                        this.tasks[0].cb();
                                    }
                                    this.tasks.shift();
                                    result && this.clearCachedObjects();
                                    setTimeout(this.processTasks, 0);
                                })
                        } else {
                            console.log('Invalid object: ' + task.id);
                            if (typeof this.tasks[0].cb === 'function') {
                                this.tasks[0].cb();
                            }
                            this.tasks.shift();
                            setTimeout(this.processTasks, 0);
                        }
                    } else {
                        if (typeof this.tasks[0].cb === 'function') {
                            this.tasks[0].cb();
                        }
                        this.tasks.shift();
                        setTimeout(this.processTasks, 0);
                    }
                })
                .catch(e => window.alert('Cannot get object: ' + e))

        } else if (task.name === 'saveNativeSettings') {
            this.socket.getObject(task.id)
                .then(obj => {
                    if (JSON.stringify(obj.native) !== JSON.stringify(task.settings)) {
                        Object.assign(obj.native, task.settings);
                        return this.socket.setObject(obj._id, obj)
                            .then(() => true)
                            .catch(err => {
                                console.error('Cannot save: ' + obj._id);
                                this.showError(`Cannot save ${obj._id}: ${err}`);
                                return false;
                            })
                            .then(result => {
                                if (result) {
                                    this.objects[obj._id] = obj;
                                }
                                if (typeof this.tasks[0].cb === 'function') {
                                    this.tasks[0].cb();
                                }
                                this.tasks.shift();
                                result && this.clearCachedObjects();
                                setTimeout(this.processTasks, 0);
                            });
                    } else {
                        if (typeof this.tasks[0].cb === 'function') {
                            this.tasks[0].cb();
                        }
                        this.tasks.shift();
                        setTimeout(this.processTasks, 0);
                    }
                })
                .catch(e => window.alert('Cannot get object: ' + e))
        } else {
            if (typeof this.tasks[0].cb === 'function') {
                this.tasks[0].cb();
            }
            this.tasks.shift();
            setTimeout(this.processTasks, 0);
        }
    }

    onSaveSettings = (id, settings, defaultSettings, cb) => {
        if (typeof defaultSettings === 'function') {
            cb = defaultSettings;
            defaultSettings = {};
        }

        if (settings.background && typeof settings.background === 'object') {
            let fileName = `/${Utils.namespace}.0/${this.user}/${settings.background.name}`;

            if (settings.background.data.startsWith('data:')) {
                settings.background.data = settings.background.data.split(',')[1];
            }
            // upload image
            this.socket.writeFile64(Utils.namespace + '.0', `/${this.user}/${settings.background.name}`, settings.background.data)
                .then(() => {
                    settings.background = fileName;
                    this.tasks.push({ name: 'saveSettings', id, settings, defaultSettings, cb });

                    if (this.tasks.length === 1) {
                        this.processTasks();
                    }
                })
                .catch(err => window.alert('Cannot upload file: ' + err));
        } else {
            //Utils.setSettings(objects[id], settings, {user: this.user, language: I18n.getLanguage()});
            this.tasks.push({ name: 'saveSettings', id, settings, defaultSettings, cb });

            if (this.tasks.length === 1) {
                this.processTasks();
            }
        }
    }

    getTitle() {
        if (!this.state.viewEnum || !this.objects) {
            return <span>ioBroker</span>;
        }

        if (this.state.viewEnum === Utils.INSTANCES) {
            return <span>{I18n.t('Menu ' + Utils.INSTANCES)}</span>;
        }

        if (this.state.width < 500) {
            return <span>{this.state.settings && this.state.settings.name}</span>;
        } else if (this.state.width < 1000) {
            return <span>{Utils.getObjectName(this.objects, this.state.masterPath, null, { language: I18n.getLanguage() })} / {this.state.settings && this.state.settings.name}</span>;
        } else {
            return <span>{Utils.getObjectName(this.objects, this.state.masterPath, null, { language: I18n.getLanguage() })} / {this.state.settings && this.state.settings.name}</span>;
        }
    }

    onSpeech = isStart =>
        this.setState({ isListening: isStart });

    onSpeechRec = text =>
        this.socket.setState('text2command.' + ((this.state.appSettings && this.state.appSettings.text2command) || 0) + '.text', text)
            .catch(e => window.alert('Cannot send command: ' + e));

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

    getDateFormat() {
        let format = 'DD.MM.YYYY';
        if (this.objects['system.config'] && this.objects['system.config'].common) {
            if (this.objects['system.config'].common.format === 'en') {
                format = this.objects['system.config'].common.format;
            }
        }
        return format;
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

    toggleEditMode = () =>
        this.setState({ editMode: !this.state.editMode });

    editEnumSettingsOpen = () =>
        this.setState({ editEnumSettings: true });

    editEnumSettingsClose = () =>
        this.setState({ editEnumSettings: false });

    editAppSettingsOpen = () => {
        if (!this.state.appSettings || !this.state.appSettings.instances) {
            this.readInstancesData(true)
                .then(() => this.setState({ editAppSettings: true }));
        } else {
            this.setState({ editAppSettings: true });
        }
    }

    editAppSettingsClose = () =>
        this.setState({ editAppSettings: false });

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
                { label: I18n.t('left'), value: 'left' },
                { label: I18n.t('center'), value: 'center' },
                { label: I18n.t('right'), value: 'right' }
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
            result.push({ value: '', label: I18n.t('default') });
        }
        root = root || 'enum';
        settings = settings || {};

        let objects = this.objects;
        let reg = root ? new RegExp('^' + root.replace(/\./g, '\\.') + '\\.') : new RegExp('^[^.]$');
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
                settings[id] = Utils.getSettings(objects[id], { user: this.user, language: I18n.getLanguage() }, true);
            }

            if (settings[id].enabled === false || App.isEnumUsed(result, id)) {
                continue;
            }

            let subTree = this.getEnums(id, ids, settings);
            if (!subTree || !subTree.length) {
                result.push({ label: settings[id].name, value: id });
            } else {
                result.push({ label: settings[id].name, children: subTree });
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
        text2command.unshift({ label: I18n.t('disabled'), value: '' });

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
            name: 'noCache',
            value: !!appSettings.noCache,
            type: 'boolean'
        });

        settings.push({
            name: 'debug',
            value: appSettings.debug === undefined ? true : appSettings.debug,
            type: 'boolean'
        });

        return settings;
    }

    readImageNames = cb => {
        this.socket.readDir(Utils.namespace + '.0', this.user)
            .then(files => cb(files.map(file => `/${Utils.namespace}.0/${this.user}/${file.file}`)))
            .catch(e => window.alert('Cannot read directory: ' + e));
    }

    saveDialogSettings = settings => {
        settings = settings || this.state.settings;
        if (settings.background && typeof settings.background === 'object') {
            let fileName = `${this.user}/${this.state.viewEnum}.${settings.background.name.toLowerCase().split('.').pop()}`;

            if (settings.background.data.startsWith('data:')) {
                settings.background.data = settings.background.data.split(',')[1];
            }
            // upload image
            this.socket.writeFile64(Utils.namespace + '.0', fileName, settings.background.data, err => {
                if (err) {
                    window.alert(err);
                } else {
                    settings.background = `/${Utils.namespace}.0/${fileName}`;
                    if (this.state.viewEnum === Utils.INSTANCES) {
                        const appSettings = JSON.parse(JSON.stringify(this.state.appSettings || {}));
                        appSettings.instancesSettings = settings;
                        this.setState({ appSettings, settings, backgroundId: this.state.backgroundId + 1 });
                        this.saveAppSettings(appSettings);
                    } else {
                        this.setState({ settings, backgroundId: this.state.backgroundId + 1 });
                        this.onSaveSettings(this.state.viewEnum, settings);
                    }
                }
            });
        } else {
            if (this.state.viewEnum === Utils.INSTANCES) {
                const appSettings = JSON.parse(JSON.stringify(this.state.appSettings || {}));
                appSettings.instancesSettings = settings;
                this.setState({ appSettings, settings });
                this.saveAppSettings(appSettings);
            } else {
                this.setState({ settings });
                this.onSaveSettings(this.state.viewEnum, settings);
            }
        }
    }

    syncObjects = () => {
        this.setState({ refresh: true }, () => {
            window.localStorage.removeItem('data');
            window.location.reload();
        });
    }

    saveAppSettings = appSettings => {
        appSettings = appSettings || this.state.appSettings || {};
        const nativeSettings = {
            loadingBackground: appSettings.loadingBackground
        };
        const _appSettings = JSON.parse(JSON.stringify(appSettings));
        delete _appSettings.loadingBackground;

        if (appSettings.noCache && (!this.state.appSettings || this.state.appSettings.noCache !== appSettings.noCache)) {
            window.localStorage.removeItem('data');
        }

        let tasks = 0;
        if (nativeSettings.loadingBackground !== undefined) {
            tasks++;
            this.tasks.push({ name: 'saveNativeSettings', id: appConfigID, settings: nativeSettings });
        }
        tasks++;
        this.tasks.push({ name: 'saveSettings', id: appConfigID, settings: _appSettings });
        this.setState({ appSettings });

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
            return <Button className={cls.iconSettings} onClick={() => this.onUpdateVersion()} variant="contained" size="small" title={I18n.t('Update to') + ' ' + this.state.actualVersion} color="secondary">
                <IconRefresh style={{ marginRight: 5 }} /> {parseFloat(this.state.width) > 500 ? I18n.t('Update to') + ' ' + this.state.actualVersion : ''}
            </Button>;
        } else {
            return <span className={cls.iconSettings} onClick={() => this.onUpdateVersion()}>{VERSION}</span>;
        }
    }

    logout = () => {
        if (this.isCloud) {
            window.location.href = '/logout';
        } else {
            window.alert('todo');
            this.conn.logout(() => window.location.reload());
        }
    }

    getEditButton(useBright) {
        if (!this.state.connected) return null;

        // let style;
        // if (this.state.editMode) {
        //     style = { color: Theme.palette.editActive };
        // } else if (this.state.actualVersion && (this.state.actualVersion !== VERSION || (this.urlVersion && this.state.actualVersion !== this.urlVersion))) {
        //     style = { color: Theme.palette.updateAvailable };
        // } else {
        //     style = { color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark };
        // }

        return (
            <IconButton
                onClick={this.toggleEditMode}
                // style={style}
                className={clsx(cls.iconSettings, this.state.editMode && cls.iconSettingsActive)}
            >
                <IconEdit width={Theme.iconSize} height={Theme.iconSize} />
            </IconButton>
        );
    }

    onMenuClose() {
        this.setState({ open: false });
    }

    getMenu(useBright) {
        return <Drawer
            variant={this.state.menuFixed ? 'permanent' : 'temporary'}
            open={this.state.open}
            onClose={() => this.onMenuClose()}
            classes={{ paper: cls.drawerBackground }}
            className={cls.drawerStyle}
            style={{
                width: Theme.menu.width,
            }}>
            <Toolbar className={cls.toolBar}>
                <IconButton onClick={this.onToggleMenu}
                    className={cls.buttonMenu}
                >
                    <IconClose width={Theme.iconSize} height={Theme.iconSize} />
                </IconButton>
                {this.state.connected && this.state.editMode ?
                    <IconButton onClick={this.editAppSettingsOpen}
                        className={cls.buttonMenu}
                    >
                        <IconSettings width={Theme.iconSize} height={Theme.iconSize} />
                    </IconButton> : null}
                <div style={{ flexGrow: 1 }} />
                {this.state.width > 500 && !this.state.menuFixed ?
                    <IconButton onClick={this.onToggleLock}
                        className={cls.buttonMenu}
                    >
                        <IconLock width={Theme.iconSize} height={Theme.iconSize} />
                    </IconButton>
                    : null
                }
            </Toolbar>
            <MenuList
                width={Theme.menu.width}
                doNavigate={GenericApp.doNavigate}
                objects={this.objects}
                debug={this.state.appSettings ? (this.state.appSettings.debug === undefined ? true : this.state.appSettings.debug) : true}
                user={this.user}
                instances={this.state.appSettings && this.state.appSettings.instances}
                // background={this.state.appSettings && this.state.appSettings.menuBackground}
                language={I18n.getLanguage()}
                viewEnum={this.state.viewEnum}
                editMode={this.state.editMode}
                root={this.state.masterPath}
                onSaveSettings={this.onSaveSettings}
                onRootChanged={this.onRootChanged}
                onSelectedItemChanged={this.onItemSelected}
            />
        </Drawer>;
    }

    getButtonFullScreen(useBright) {
        if (App.isFullScreenSupported() && !this.initialFullScreenMode) {
            return <IconButton
                onClick={this.onToggleFullScreen}
                className={cls.iconSettings}
            >
                {this.state.fullScreen ?
                    <IconFullScreenExit width={Theme.iconSize} height={Theme.iconSize} /> :
                    <IconFullScreen width={Theme.iconSize} height={Theme.iconSize} />
                }
            </IconButton>;
        } else {
            return null;
        }
    }

    getButtonSpeech(useBright) {
        if (!this.state.editMode && this.state.connected && this.state.appSettings &&
            (this.state.appSettings.text2command || this.state.appSettings.text2command === 0) &&
            SpeechDialog.isSpeechRecognitionSupported()) {
            return <IconButton
                style={{ color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark }}
                onClick={() => this.onSpeech(true)}>
                <IconMic width={Theme.iconSize} height={Theme.iconSize} />
            </IconButton>;
        } else {
            return null;
        }
    }

    getButtonEditSettings(useBright) {
        if (this.state.connected && this.state.editMode) {
            return <IconButton
                onClick={this.editEnumSettingsOpen}
                className={cls.iconSettings}
            >
                <IconSettings width={Theme.iconSize} height={Theme.iconSize} />
            </IconButton>;
        } else {
            return null;
        }
    }

    getButtonSync(useBright) {
        if (this.state.connected && this.state.editMode && (!this.state.appSettings || !this.state.appSettings.noCache)) {
            return <IconButton
                onClick={this.syncObjects}
                title={I18n.t('Re-sync objects')}
                style={{ color: this.state.editEnumSettings ? Theme.palette.editActive : (useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark) }}>
                <IconRefresh width={Theme.iconSize} height={Theme.iconSize} />
            </IconButton>;
        } else {
            return null;
        }
    }

    getButtonLogout(useBright) {
        if (this.isCloud || this.auth) {
            return (
                <IconButton
                    onClick={this.logout}
                    title={I18n.t('Logout')}
                    style={{ color: this.state.editEnumSettings ? Theme.palette.editActive : (useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark) }}>
                    <IconLogout width={Theme.iconSize} height={Theme.iconSize} />
                </IconButton>);
        } else {
            return null;
        }
    }

    getButtonSignal(useBright) {
        if (this.state.connected) {
            return null;
        }
        return <IconButton disabled={true} style={{ color: useBright ? Theme.palette.textColorBright : Theme.palette.textColorDark }}>
            <IconSignalOff width={Theme.iconSize} height={Theme.iconSize} />
        </IconButton>;
    }

    checkThemeName = (name, instance) => {
        const themeName = this.state.themeName;
        if (name !== undefined) {
            if (name && themeName !== name && (name === 'dark' || name === 'blue' || name === 'colored' || name === 'light') && (!instance || this.browserInstance === instance)) {
                return name;
            } else if (typeof name === 'string' && /^[\],:{}\s]*$/.test(name.replace(/\\["\\\/bfnrtu]/g, '@').
                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                return this.checkThemeName(JSON.parse(name));
            } else if (typeof name === 'object' && name?.theme) {
                return this.checkThemeName(name.theme, name.instance);
            }
        }
        return null;
    }

    toggleTheme(name) {
        const themeName = this.state.themeName;

        // dark => blue => colored => light => dark
        let newThemeName = themeName === 'dark' ? 'blue' :
            (themeName === 'blue' ? 'colored' :
                (themeName === 'colored' ? 'light' : 'dark'));

        if (name !== undefined) {
            if (this.checkThemeName(name)) {
                newThemeName = this.checkThemeName(name);
            } else {
                return null;
            }
        }

        Utils.setThemeName(newThemeName);

        const theme = this.createTheme(newThemeName);

        this.setState({
            theme,
            themeName: this.getThemeName(theme),
            themeType: this.getThemeType(theme)
        }, () => {
            document.getElementsByTagName('HTML')[0].className = `${newThemeName} ${this.state.widthBlock ? 'double' : 'single'}`;
            this.socket.setState(this.statesPrefix + 'control.theme', { val: JSON.stringify({
                theme: newThemeName,
                instance: this.browserInstance
            }), ack: true });
        });
    }

    getAppBar() {
        const toolbarBackground = this.state.settings ? this.state.settings.color : undefined;
        const useBright = !toolbarBackground || Utils.isUseBright(toolbarBackground);
        return <AppBar
            position="fixed"
            className={cls.colorBar}
            style={{
                width: this.state.menuFixed ? `calc(100% - ${Theme.menu.width}px)` : '100%',
                // color: 'white',
                marginLeft: this.state.menuFixed ? Theme.menu.width : 0
            }}
        >
            <Toolbar className={cls.wrapperToolBar} >
                {toolbarBackground && <div style={{ borderColor: toolbarBackground }} className={cls.toolbarBackgroundOpacity} />}
                {!this.state.menuFixed &&
                    <IconButton color="inherit" aria-label="Menu" onClick={this.onToggleMenu} >
                        <IconMenu />
                    </IconButton>}
                <IconAdapter style={Theme.appBarIcon} src={this.state?.settings?.icon} />
                <h3 color="inherit" style={{ flex: 1 }}>
                    {this.getTitle()}
                </h3>
                {this.getVersionControl(useBright)}
                <div className={cls.blockButtons}>
                    {this.getButtonSignal(useBright)}
                    {this.getButtonEditSettings(useBright)}
                    {this.getButtonSync(useBright)}
                    {this.state.editMode &&
                        <Tooltip title={I18n.t('Change size block')}>
                            <IconButton
                                onClick={() => {
                                    let widthBlock = !this.state.widthBlock;
                                    this.setState({ widthBlock }, () => {
                                        window.localStorage.setItem('Material.width', widthBlock);
                                        document.getElementsByTagName('HTML')[0].className = `${this.state.themeName} ${widthBlock ? 'double' : 'single'}`;
                                    })
                                }}
                                className={clsx(cls.iconSettings, this.state.widthBlock && cls.iconSettingsActive)}
                            >
                                <GiResize width={Theme.iconSize} height={Theme.iconSize} />
                            </IconButton>
                        </Tooltip>}
                    {this.state.editMode && <ToggleThemeMenu
                        toggleTheme={() => this.toggleTheme()}
                        themeName={this.state.themeName}
                        className={cls.iconSettings}
                        t={I18n.t} />}
                    {this.getEditButton(useBright)}
                    {this.getButtonSpeech(useBright)}
                    {this.getButtonLogout(useBright)}
                    {this.getButtonFullScreen(useBright)}
                </div>
                {this.state.editEnumSettings ? <DialogSettings key={'enum-settings'}
                    name={this.getTitle()}
                    // transparent
                    windowWidth={parseFloat(this.state.width)}
                    getImages={this.readImageNames}
                    dialogKey={'enum-settings'}
                    settings={this.getDialogSettings()}
                    onSave={this.saveDialogSettings}
                    onClose={this.editEnumSettingsClose}

                /> : null}
                {this.state.editAppSettings ? <DialogSettings key={'app-settings'}
                    windowWidth={parseFloat(this.state.width)}
                    name={I18n.t('App settings')}
                    dialogKey={'app-settings'}
                    settings={this.getAppSettings()}
                    onSave={this.saveAppSettings}
                    onClose={this.editAppSettingsClose}

                /> : null}
            </Toolbar>
        </AppBar>;
    }

    getStateList() {
        if (!this.state.viewEnum) {
            return null;
        }
        return <StatesList
            objects={this.state.viewEnum === Utils.INSTANCES ? this.instances : this.objects}
            user={this.user}
            states={this.states}
            socket={this.socket}
            getLocation={GenericApp.getLocation}
            doNavigate={GenericApp.doNavigate}
            allObjects={this.allObjects}
            systemConfig={this.systemConfig}
            widthBlock={this.state.widthBlock}
            align={this.state.settings && this.state.settings.align}
            debug={this.state.appSettings ? (this.state.appSettings.debug === undefined ? true : this.state.appSettings.debug) : true}
            connected={this.state.connected}
            ignoreIndicators={((this.state.appSettings && this.state.appSettings.ignoreIndicators) || '').split(',')}
            backgroundColor={(this.state.settings && this.state.settings.backgroundColor) || ''}
            background={(this.state.settings && this.state.settings.background) || ''}
            backgroundId={this.state.backgroundId}
            newLine={this.state.settings && this.state.settings.newLine}
            editMode={this.state.editMode}
            themeType={this.state.themeType}
            themeName={this.state.themeName}
            windowWidth={parseFloat(this.state.width)}
            windowHeight={parseFloat(this.state.height)}
            // marginLeft={this.state.menuFixed ? Theme.menu.width : 0}
            enumID={this.state.viewEnum}
            onSaveSettings={this.onSaveSettings}
            onControl={this.onControl}
            onCollectIds={this.onCollectIds}
        />;
    }

    getErrorDialog() {
        return <Dialog
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            onClose={() => this.setState({ errorShow: false })}
            open={!!this.state.errorShow}
        >
            <DialogTitle id="alert-dialog-title">{I18n.t('Error')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {this.state.errorText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={() => this.setState({ errorShow: false })}
                    color="primary"
                    startIcon={<IconCheck />}
                >OK</Button>
            </DialogActions>
        </Dialog>;
    }

    getSpeechDialog() {
        if (this.state.appSettings && (this.state.appSettings.text2command || this.state.appSettings.text2command === 0)) {
            return SpeechDialog.isSpeechRecognitionSupported() ?
                <SpeechDialog
                    objects={this.objects}
                    isShow={this.state.isListening}
                    locale={this.getLocale()}
                    onSpeech={this.onSpeechRec}
                    onFinished={() => this.onSpeech(false)}
                /> : null;
        } else {
            return null;
        }
    }

    getLoadingScreen() {
        const background = window.materialBackground;
        const useBright = background && Utils.isUseBright(background);

        return <div className={cls.backgroundLoading}>
            <LoadingIndicator
                variant={this.gotObjects ? 'indeterminate' : 'determinate'}
                value={100 * this.state.loadingProgress / App.LOADING_TOTAL}
                label={I18n.t(this.state.loadingStep)}
            />
        </div>;
    }

    render() {
        if (this.state.loading) {
            return this.getLoadingScreen();
        } else {
            const useBright = this.state.appSettings && this.state.appSettings.menuBackground && Utils.isUseBright(this.state.appSettings.menuBackground);

            if (window.__material_instance && this.browserInstance !== window.__material_instance) {
                this.browserInstance = window.__material_instance;
                console.log('Set instance ' + window.__material_instance);
            }

            return <MuiThemeProvider theme={this.state.theme}>
                <div id="app" className={cls.wrapperApp}>
                    {this.getAppBar(useBright)}
                    {this.getMenu(useBright)}
                    {!this.state.bigMessage ? this.getStateList(useBright) : <div style={{
                        position: 'absolute',
                        fontSize: 36,
                        top: '50%',
                        width: '100%',
                        textAlign: 'center'
                    }}>{this.state.bigMessage}</div>}
                    {this.getErrorDialog(useBright)}
                    {this.getSpeechDialog(useBright)}
                </div>
            </MuiThemeProvider>;
        }
    }
}

export default withSnackbar(withStyles(styles)(App));
