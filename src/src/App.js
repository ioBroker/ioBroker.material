import React, { Component } from 'react';
import './App.css';
import MenuList from './MenuList';
import StatesList from './StatesList';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import IconClose from 'react-icons/lib/md/close';
import IconSettings from 'react-icons/lib/md/mode-edit';
import IconEdit from 'react-icons/lib/md/settings';
import IconSignalOff from 'react-icons/lib/md/signal-wifi-off';
import IconLock from 'react-icons/lib/md/lock';
import IconFullScreen from 'react-icons/lib/md/fullscreen';
import IconFullScreenExit from 'react-icons/lib/md/fullscreen-exit';
import IconMic from 'react-icons/lib/md/mic';
import Utils from './Utils';
import Dialog from '@material-ui/core/Dialog';
import DialogSettings from './States/SmartDialogSettings'
import RaisedButton from '@material-ui/core/Button';
import SpeechDialog from './SpeechDialog';
import Theme from './theme';
import MenuIcon from 'react-icons/lib/md/menu';
import I18n from './i18n';
import version from './version';
import Button from '@material-ui/core/Button';
import IconRefresh from 'react-icons/lib/md/refresh';

const isKeyboardAvailableOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

const text2CommandInstance = 0;
const NAMESPACE = 'material.0';

class App extends Component {
    // ensure ALLOW_KEYBOARD_INPUT is available and enabled

    constructor(props) {
        super(props);

        let path = decodeURIComponent(window.location.hash).replace(/^#/, '');

        this.state = {
            menuFixed:      (typeof Storage !== 'undefined') ? window.localStorage.getItem('menuFixed') === '1' : false,
            open:           false,
            isListening:    false,
            loading:        true,
            connected:      false,
            refresh:        false,
            errorShow:      false,
            fullScreen:     false,
            editMode:       false,
            errorText:      '',
            masterPath:     path ? 'enum.' + path.split('.').shift() : 'enum.rooms',
            viewEnum:       path ? 'enum.' + path : '',
            width:          '0',
            backgroundId:   0,
            editEnumSettings: false,
            settings:       null,
            actualVersion:  ''
        };
        this.state.open = this.state.menuFixed;

        this.objects = {};
        this.states = {};
        this.tasks = [];
        this.user = 'admin';

        this.subscribes = {};
        this.requestStates = [];
        this.conn = window.servConn;
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    showError (err) {
        this.setState({errorText: err, errorShow: true});
    }

    componentDidUpdate (prevProps, prevState) {
        //console.log(prevProps);
    }

    componentDidMount () {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.conn.namespace   = 'mobile.0';
        this.conn._useStorage = false;

        this.conn.init({
            name:          'mobile.0',  // optional - default 'vis.0'
            connLink:      (typeof socketUrl === 'undefined') ? '/' : undefined,  // optional URL of the socket.io adapter
//            socketSession: ''           // optional - used by authentication
        }, {
            onConnChange: function (isConnected) { // no lambda here
                if (isConnected) {
                    this.user = this.conn.getUser().replace(/^system\.user\./, '');

                    this.conn.getObject('system.adapter.material', function (err, obj) {
                        obj && obj.common && obj.common.version && this.setState({actualVersion: obj.common.version});
                    }.bind(this));

                    this.conn.getObjects(!this.state.refresh, function (err, objects) {
                        if (err) {
                            this.showError(err);
                        } else {
                            let viewEnum;
                            this.conn.getObject('system.config', function (err, config) {
                                if (objects && !this.state.viewEnum) {
                                    let reg = new RegExp('^' + this.state.masterPath + '\\.');
                                    // get first room
                                    for (let id in objects) {
                                        if (objects.hasOwnProperty(id) && reg.test(id)) {
                                            viewEnum = id;
                                            break;
                                        }
                                    }
                                }
                                objects['system.config'] = config;

                                I18n.setLanguage(config && config.common && config.common.language);

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
                                viewEnum = viewEnum || this.state.viewEnum;

                                this.objects = result || {};
                                if (viewEnum) {
                                    this.setState({
                                        viewEnum: viewEnum,
                                        loading: false,
                                        settings: Utils.getSettings((result || {})[viewEnum], {user: this.user, language: I18n.getLanguage()})
                                    });
                                } else {
                                    this.setState({loading: false});
                                }
                                this.conn.subscribe(['text2command.' + text2CommandInstance + '.response']);
                            }.bind(this));
                        }
                    }.bind(this));
                }
                this.setState({connected: isConnected, loading: true});
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

                    if (state && !state.ack && state.val && id === 'text2command.' + text2CommandInstance + '.response') {
                        this.speak(state.val);
                    }
                }, 0);
            }.bind(this),
            onError: function (err) { // no lambda here
                this.showError(err);
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
            this.setState({width: window.innerWidth/*, height: window.innerHeight*/});
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

    onItemSelected(id) {
        window.location.hash = encodeURIComponent(id.replace(/^enum\./, ''));

        // load settings for this enum
        this.setState({
            viewEnum: id,
            open: this.state.menuFixed,
            settings: Utils.getSettings(this.objects[id], {user: this.user, language: I18n.getLanguage()})
        });
    }

    onRootChanged(root, page) {
        if (page) {
            window.location.hash = encodeURIComponent(page.replace(/^enum\./, ''));
            this.setState({masterPath: root, viewEnum: page});
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
            ids.forEach(id => {
                if (!this.subscribes[id]) {
                    newIDs.push(id);
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

    onControl(id, val) {
        this.conn.setState(id, val);
    }

    processTasks() {
        if (!this.tasks.length) {
            return;
        }

        const task = this.tasks[0];

        if (task.name === 'saveSettings') {
            this.conn.getObject(task.id, (err, obj) => {
                let settings = Utils.getSettings(obj, {user: this.user, language: I18n.getLanguage()});
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
        } else {
            if (typeof this.tasks[0].cb === 'function') {
                this.tasks[0].cb();
            }
            this.tasks.shift();
            setTimeout(this.processTasks.bind(this), 0);
        }
    }

    onSaveSettings(id, settings, cb) {
        this.tasks.push({name: 'saveSettings', id, settings, cb});
        if (this.tasks.length === 1) {
            this.processTasks();
        }
    }

    getTitle() {
        if (!this.state.viewEnum || !this.objects) {
            return (<span>ioBroker</span>);
        }

        if (this.state.width < 500) {
            return (<span>{this.state.settings && this.state.settings.name}</span>);
        } else if (this.state.width < 1000) {
            return (<span>{Utils.getObjectName(this.objects, this.state.masterPath)} / {this.state.settings && this.state.settings.name}</span>);
        } else {
            return (<span>{Utils.getObjectName(this.objects, this.state.masterPath)} / {this.state.settings && this.state.settings.name}</span>);
        }
    }

    onSpeech(isStart) {
        this.setState({isListening: isStart});
    }

    onSpeechRec(text) {
        this.conn.setState('text2command.' + text2CommandInstance + '.text', text);
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

    getDialogSettings(settings) {
        settings = settings || [];

        settings.unshift({
            name: 'icon',
            value: this.state.settings.icon || '',
            type: 'icon'
        });
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
        return settings;
    }

    readImageNames(cb) {
        const dir = `/${NAMESPACE}/${this.user}/`;
        this.conn.readDir(dir, (err, files) => {
            cb(files.map(file => dir + file.file));
        });
    }

    saveDialogSettings(settings) {
        settings = settings || this.state.settings;
        if (settings.background && typeof settings.background === 'object') {
            let fileName = `/${NAMESPACE}/${this.user}/${this.state.viewEnum}.${settings.background.ext}`;

            // upload image
            this.conn.writeFile64(fileName, settings.background.data, function (err) {
                if (err) {
                    window.alert(err);
                } else {
                    settings.background = fileName;
                    this.setState({settings, backgroundId: this.state.backgroundId + 1});
                    this.onSaveSettings(this.state.viewEnum, settings);
                }
            }.bind(this));
        } else {
            this.setState({settings});
            this.onSaveSettings(this.state.viewEnum, settings);
        }
    }

    static onUpdateVersion() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
                setTimeout(() => document.location.reload(), 1000);
            });
        }
    }

    getVersionControl() {
        if (!this.state.editMode) return null;
        if (this.state.actualVersion && this.state.actualVersion !== version) {
            return (<Button onClick={() => App.onUpdateVersion()} variant="contained" size="small" color="secondary">
                <IconRefresh style={{marginRight: 5}}/> {I18n.t('Update to')} {this.state.actualVersion}
            </Button>);
        } else {
            return (<span onClick={() => App.onUpdateVersion()}>{version}</span>);
        }
    }

    getEditButton() {
        if (!this.state.connected) return null;

        let style;
        if (this.state.editMode) {
            style = {color: Theme.palette.editActive};
        } else if (this.state.actualVersion && this.state.actualVersion !== version) {
            style = {color: Theme.palette.updateAvailable};
        } else {
            style = {color: Theme.palette.textColor};
        }

        return (
            <IconButton
            onClick={this.toggleEditMode.bind(this)}
            style={style}>
                <IconEdit width={Theme.iconSize} height={Theme.iconSize}/>
            </IconButton>
        );
    }

    render() {
        return (
            <div>
                <AppBar
                    position="fixed"
                    style={{
                        width: this.state.menuFixed ? 'calc(100% - ' +  Theme.menu.width + 'px)' : '100%',
                        color: Theme.palette.textColor,
                        marginLeft: this.state.menuFixed ? Theme.menu.width : 0
                    }}
                >
                    <Toolbar style={{background: this.state.settings ? this.state.settings.color : undefined}}>
                        {!this.state.menuFixed &&
                            (<IconButton color="inherit" aria-label="Menu" onClick={this.onToggleMenu.bind(this)} >
                                <MenuIcon/>
                            </IconButton>)}
                        {Utils.getIcon(this.state.settings, Theme.appBarIcon)}
                        <Typography variant="title" color="inherit" style={{flex: 1}}>
                            {this.getTitle()}
                        </Typography>
                        <div style={{color: Theme.palette.textColor}}>
                            {this.getVersionControl()}
                            {this.state.connected ? null : (<IconButton disabled={true}><IconSignalOff width={Theme.iconSize} height={Theme.iconSize}/></IconButton>)}
                            {this.state.connected && this.state.editMode ? (<IconButton onClick={this.editEnumSettingsOpen.bind(this)} style={{color: this.state.editEnumSettings ? Theme.palette.editActive: Theme.palette.textColor}}><IconSettings width={Theme.iconSize} height={Theme.iconSize}/></IconButton>) : null}
                            {this.getEditButton()}
                            {this.state.connected && SpeechDialog.isSpeechRecognitionSupported() ? <IconButton style={{color: Theme.palette.textColor}} onClick={() => this.onSpeech(true)}><IconMic width={Theme.iconSize} height={Theme.iconSize}/></IconButton> : null}
                            {App.isFullScreenSupported() ?
                                <IconButton style={{color: Theme.palette.textColor}} onClick={this.onToggleFullScreen.bind(this)}>{this.state.fullScreen ? <IconFullScreenExit width={Theme.iconSize} height={Theme.iconSize} /> : <IconFullScreen width={Theme.iconSize} height={Theme.iconSize} />}</IconButton> : null}
                        </div>
                        {this.state.editEnumSettings ? (<DialogSettings key={'enum-settings'}
                                                           name={this.getTitle()}
                                                           getImages={this.readImageNames.bind(this)}
                                                           dialogKey={'enum-settings'}
                                                           settings={this.getDialogSettings()}
                                                           onSave={this.saveDialogSettings.bind(this)}
                                                           onClose={this.editEnumSettingsClose.bind(this)}
                        />): null}
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant={this.state.menuFixed ? 'permanent' : 'temporary'}
                    open={this.state.open}
                    onClose={() => this.setState({open: false})}
                    style={{width: Theme.menu.width}}>
                    <Toolbar>
                        <IconButton onClick={this.onToggleMenu.bind(this)} style={{color: Theme.palette.textColor}}>
                            <IconClose width={Theme.iconSize} height={Theme.iconSize} />
                        </IconButton>

                        <div style={{flex: 1}}>
                        </div>

                        {this.state.width > 500 && !this.state.menuFixed ?
                            (<IconButton onClick={this.onToggleLock.bind(this)} style={{float: 'right', color: Theme.palette.textColor}}>
                                <IconLock width={Theme.iconSize} height={Theme.iconSize}/>
                            </IconButton>)
                            : null
                        }
                    </Toolbar>
                    <MenuList
                        width={Theme.menu.width}
                        objects={this.objects}
                        user={this.user}
                        language={this.language}
                        selectedId={this.state.viewEnum}
                        editMode={this.state.editMode}
                        root={this.state.masterPath}
                        onSaveSettings={this.onSaveSettings.bind(this)}
                        onRootChanged={this.onRootChanged.bind(this)}
                        onSelectedItemChanged={this.onItemSelected.bind(this)}
                    />
                </Drawer>
                <StatesList
                    loading={this.state.loading}
                    objects={this.objects}
                    user={this.user}
                    states={this.states}
                    backgroundColor={(this.state.settings && this.state.settings.backgroundColor) || ''}
                    background={(this.state.settings && this.state.settings.background) || ''}
                    backgroundId={this.state.backgroundId}
                    newLine={this.state.settings && this.state.settings.newLine}
                    editMode={this.state.editMode}
                    windowWidth={this.state.width}
                    marginLeft={this.state.menuFixed ? Theme.menu.width : 0}
                    enumID={this.state.viewEnum}
                    onSaveSettings={this.onSaveSettings.bind(this)}
                    onControl={this.onControl.bind(this)}
                    onCollectIds={this.onCollectIds.bind(this)}/>

                <Dialog
                    actions={(<RaisedButton
                        label="Ok"
                        primary={true}
                        onClick={() => this.setState({errorShow: false})}
                    />)}
                    modal={false}
                    open={this.state.errorShow}
                    onRequestClose={() => this.setState({errorShow: false})}
                >
                    {this.state.errorText}
                </Dialog>
                {SpeechDialog.isSpeechRecognitionSupported() ?
                    <SpeechDialog
                        objects={this.objects}
                        isShow={this.state.isListening}
                        locale={this.getLocale()}
                        onSpeech={this.onSpeechRec.bind(this)}
                        onFinished={() => this.onSpeech(false)}
                    /> : null}
            </div>
        );
    }
}

export default App;
