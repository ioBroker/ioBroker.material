import React, { Component } from 'react';
import './App.css';
import MenuList from './List.js';
import StatesList from './StatesList';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import IconClose from 'react-icons/lib/md/close';
import IconEdit from 'react-icons/lib/md/mode-edit';
import IconSignalOff from 'react-icons/lib/md/signal-wifi-off';
import IconLock from 'react-icons/lib/md/lock';
import IconFullScreen from 'react-icons/lib/md/fullscreen';
import IconFullScreenExit from 'react-icons/lib/md/fullscreen-exit';
import IconMic from 'react-icons/lib/md/mic';
import Utils from './Utils';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import SpeechDialog from './SpeechDialog';
import Theme from './theme';

const isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

const text2CommandInstance = 0;

class App extends Component {
    // ensure ALLOW_KEYBOARD_INPUT is available and enabled

    constructor(props) {
        super(props);

        let path = window.location.hash.replace(/^#/, '');

        this.state = {
            menuFixed:      (typeof Storage !== 'undefined') ? window.localStorage.getItem('menuFixed') === '1' : false,
            open:           false,
            objects:        {},
            isListening:    false,
            loading:        true,
            connected:      false,
            refresh:        false,
            errorShow:      false,
            fullScreen:     false,
            errorText:      '',
            masterPath:     path ? 'enum.' + path.split('.').shift() : 'enum.rooms',
            viewEnum:       path ? 'enum.' + path : '',
            width:          '0'
        };
        this.state.open = this.state.menuFixed;

        this.states = {};

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

        //window.moment.locale('ru');

        this.conn.namespace   = 'mobile.0';
        this.conn._useStorage = false;

        let that = this;

        this.conn.init({
            name:          'mobile.0',  // optional - default 'vis.0'
            connLink:      (typeof socketUrl === 'undefined') ? '/' : undefined,  // optional URL of the socket.io adapter
//            socketSession: ''           // optional - used by authentication
        }, {
            onConnChange: isConnected => {
                if (isConnected) {
                    that.conn.getObjects(!that.state.refresh, function (err, objects) {
                        if (err) {
                            that.showError(err);
                        } else {
                            let viewEnum;
                            if (objects && !that.state.viewEnum) {
                                let reg = new RegExp('^' + that.state.masterPath + '\\.');
                                // get first room
                                for (let id in objects) {
                                    if (objects.hasOwnProperty(id) && reg.test(id)) {
                                        viewEnum = id;
                                        break;
                                    }
                                }
                            }
                            let keys = Object.keys(objects);
                            keys.sort();
                            let result = {};
                            for (let k = 0; k < keys.length; k++) {
                                if (keys[k].match(/^system\./)) continue;
                                result[keys[k]] = objects[keys[k]];
                            }

                            if (viewEnum) {
                                that.setState({objects: result || {}, viewEnum: viewEnum, loading: false});
                            } else {
                                that.setState({objects: result || {}, loading: false});
                            }
                            that.conn.subscribe(['text2command.' + text2CommandInstance + '.response']);
                        }
                    });
                }
                that.setState({connected: isConnected, loading: true});
            },
            onRefresh: () => {
                window.location.reload();
            },
            onUpdate: (id, state) => {
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
            },
            onError: err => {
                that.showError(err);
            }
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
            window.localStorage.setItem('menuFixed', '0')
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
                    element.webkitRequestFullscreen(isKeyboardAvailbleOnFullScreen);
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
        window.location.hash = id.replace(/^enum\./, '');
        this.setState({viewEnum: id, open: this.state.menuFixed});
    }

    onRootChanged(root, page) {
        if (page) {
            window.location.hash = page.replace(/^enum\./, '');
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
            Object.keys(states).forEach((id) => {
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

    getTitle () {
        if (!this.state.viewEnum || !this.state.objects) {
            return (<span>ioBroker</span>);
        }

        if (this.state.width < 500) {
            return (<span>{Utils.getObjectName(this.state.objects, this.state.viewEnum)}</span>);
        } else if (this.state.width < 1000) {
            return (<span>{Utils.getObjectName(this.state.objects, this.state.masterPath)} / {Utils.getObjectName(this.state.objects, this.state.viewEnum)}</span>);
        } else {
            return (<span>{Utils.getObjectName(this.state.objects, this.state.masterPath)} / {Utils.getObjectName(this.state.objects, this.state.viewEnum)}</span>);
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
        if (this.state.objects['system.config'] && this.state.objects['system.config'].common) {
            if (this.state.objects['system.config'].common.language === 'en') {
                locale = 'en-US';
            } else if (this.state.objects['system.config'].common.language === 'en') {
                locale = 'ru-RU';
            }
        }
        return locale;
    }

    render() {
        return (
            <div style={this.state.menuFixed ? {paddingLeft: 250}: {}}>
                <AppBar
                    style={{position: 'fixed', width: this.state.menuFixed ? 'calc(100% - 250px)' : '100%', color: Theme.palette.textColor}}
                    title={this.getTitle()}
                    showMenuIconButton={!this.state.menuFixed}

                    iconElementRight={
                        <div style={{color: Theme.palette.textColor}}>
                            {this.state.connected ? null : (<IconButton disabled={true}><IconSignalOff width={Theme.iconSize} height={Theme.iconSize}/></IconButton>)}
                            <IconButton onClick={() => this.showError('Not implemented')} style={{color: Theme.palette.textColor}}><IconEdit width={Theme.iconSize} height={Theme.iconSize}/></IconButton>
                            {SpeechDialog.isSpeechRecognitionSupported() ? <IconButton style={{color: Theme.palette.textColor}} onClick={() => this.onSpeech(true)}><IconMic width={Theme.iconSize} height={Theme.iconSize}/></IconButton> : null}
                            {App.isFullScreenSupported() ?
                                <IconButton style={{color: Theme.palette.textColor}} onClick={() => this.onToggleFullScreen()}>{this.state.fullScreen ? <IconFullScreenExit width={Theme.iconSize} height={Theme.iconSize} /> : <IconFullScreen width={Theme.iconSize} height={Theme.iconSize} />}</IconButton> : null}
                    </div>}
                    onLeftIconButtonClick={() => this.onToggleMenu()}
                />

                <Drawer open={this.state.open} width={250}>
                    <IconButton onClick={() => this.onToggleMenu()} style={{color: Theme.palette.textColor}}>
                        <IconClose width={Theme.iconSize} height={Theme.iconSize} />
                    </IconButton>

                    {this.state.width > 500 && !this.state.menuFixed ?
                        (<IconButton onClick={() => this.onToggleLock()} style={{float: 'right', height: 40,color: Theme.palette.textColor}}>
                            <IconLock width={Theme.iconSize} height={Theme.iconSize}/>
                        </IconButton>)
                        : null
                    }

                    <MenuList
                        objects={this.state.objects}
                        selectedId={this.state.viewEnum}
                        root={this.state.masterPath}
                        onRootChanged={(root, page) => this.onRootChanged(root, page)}
                        onSelectedItemChanged={(id) => this.onItemSelected(id)}
                    />
                </Drawer>
                <StatesList
                    loading={this.state.loading}
                    style={{paddingTop: 50}}
                    objects={this.state.objects}
                    states={this.states}
                    windowWidth={this.state.width}
                    enumID={this.state.viewEnum}
                    onControl={(id, val) => this.onControl(id, val)}
                    onCollectIds={(elem, ids, isMount) => this.onCollectIds(elem, ids, isMount)}/>

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
                {SpeechDialog.isSpeechRecognitionSupported() ? <SpeechDialog objects={this.state.objects} isShow={this.state.isListening} locale={this.getLocale()} onSpeech={(text) => this.onSpeechRec(text)} onFinished={() => this.onSpeech(false)} /> : null}
            </div>
        );
    }
}

export default App;
