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
import SmartGeneric from '../SmartGeneric';
import Fab from '@material-ui/core/Fab';

import {MdMusicNote as IconNote} from 'react-icons/md';
import {MdPlayArrow as IconPlay} from 'react-icons/md';
import {MdPause as IconPause} from 'react-icons/md';
import {MdStop as IconStop} from 'react-icons/md';
import {MdSkipNext as IconNext} from 'react-icons/md';
import {MdSkipPrevious as IconPrev} from 'react-icons/md';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import Theme from '../../theme';
// import cover from '../assets/cover.png';
import Dialog from '../../Dialogs/SmartDialogMedia';

const style = {
    info: {
        div: {
            background: 'rgba(0,0,0,0.55)',
            position: 'absolute',
            bottom: 50,
            width: 'calc(100% + 1rem)',
            left: '-0.5rem',
            paddingLeft: '1.2rem'
        },
        name: {
            fontSize: 10,
            fontWeight: 'normal',
            color: 'white'
        },
        artist: {
            fontSize: 12,
            fontWeight: 'normal',
            color: 'white'
        },
        album: {
            fontSize: 16,
            fontWeight: 'normal',
            color: 'white'
        },
        title: {
            fontSize: 12,
            fontWeight: 'normal',
            color: 'white'
        }
    },
    control: {
        div: {
            background: 'rgba(255,255,255,0.9)',
            position: 'absolute',
            width: 'calc(100% + 1rem)',
            bottom: 0,
            left: '-0.5rem',
            height: 48,
            textAlign: 'center',
            lineHeight: '48px',
            verticalAlign: 'middle'
        },
        prev: {
            height: 24,
            width: 24,
            marginLeft: 3,
            minHeight: 24,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(255,255,255,1)'
        },
        next: {
            height: 24,
            width: 24,
            marginLeft: 3,
            minHeight: 24,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(255,255,255,1)'
        },
        stop: {
            height: 24,
            width: 24,
            minHeight: 24,
            marginLeft: 3,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(255,255,255,1)'
        },
        play: {

        },
        pause: {
            background: '#40EE40'
        },
        name: {
            position: 'absolute',
            left: '1.2rem',
            bottom: 2,
            fontSize: 14,
            color: 'rgba(0,0,0,0.6)'
        }
    },
    time: {
        div: {

        },
        elapsed: {

        },
        duration: {

        },
        slider: {

        }
    }
};

class SmartMedia extends SmartGeneric {
    constructor(props) {
        super(props);
        this.ids = {
            info: {
                cover: null,
                artist: null,
                album: null,
                title: null
            },
            buttons: {
                play: null,
                pause: null,
                stop: null,
                prev: null,
                next: null
            },
            control: {
                state: null,
                elapsed: null,
                duration: null,
                seek: null
            },
            volume: {
                set: null,
                actual: null,
                mute: null
            },
            mode: {
                repeat: null,
                shuffle: null
            }
        };

        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'STATE');
            if (state) {
                this.id = state.id;
                this.ids.control.state = state.id;
            } else {
                this.id = '';
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'COVER');
            this.ids.info.cover = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ARTIST');
            this.ids.info.artist = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ALBUM');
            this.ids.info.album = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'TITLE');
            this.ids.info.title = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PLAY');
            this.ids.buttons.play = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PAUSE');
            this.ids.buttons.pause = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STOP');
            this.ids.buttons.stop = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'NEXT');
            this.ids.buttons.next = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PREV');
            this.ids.buttons.prev = state && state.id;

            // no automatic subscription
            state = this.channelInfo.states.find(state => state.id && state.name === 'DURATION');
            this.ids.control.duration = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'SEEK');
            this.ids.control.seek = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ELAPSED');
            this.ids.control.elapsed = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'VOLUME');
            this.ids.volume.set = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'VOLUME_ACTUAL');
            this.ids.volume.actual = state ? state.id : this.ids.volume.set;

            state = this.channelInfo.states.find(state => state.id && state.name === 'MUTE');
            this.ids.volume.mute = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'SHUFFLE');
            this.ids.mode.shuffle = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'REPEAT');
            this.ids.mode.repeat = state && state.id;
        }

        this.width = 2;
        this.props.tile.setState({
            isPointer: true
        });
        this.key = 'smart-switch-' + this.id + '-';
        this.doubleState = true; // used in generic

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        // this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (!state) {
            return;
        }

        if (id === this.ids.info.cover) {
            let url = state && state.val;
            if (url) {
                // url = cover;
                if (url.match(/\?.+$/)) {
                    url += '&ts=' + Date.now();
                } else {
                    url += '?ts=' + Date.now();
                }
            }
            this.props.tile.setBackgroundImage(url || '');
            this.setState({[id]: url});
        } else
        if (id === this.ids.info.album) {
            this.setState({[id]: state.val});
        } else
        if (id === this.ids.info.artist) {
            this.setState({[id]: state.val});
        } else
        if (id === this.ids.info.title) {
            this.setState({[id]: state.val});
        } else
        if (this.id === id && state.ack) {
            const val =
                state.val === 'true' ||
                state.val === true ||
                state.val === 'PLAY' ||
                state.val === 'play' ||
                state.val === 1 ||
                state.val === '1';
            this.setState({[id]: val});

            if (state.ack && this.state.executing) {
                this.setState({executing: false});
            }

            this.props.tile.setState({
                state: val
            });
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        if (this.state[this.ids.info.cover]) {
            return null;
        } else {
            let customIcon;

            if (this.state.settings.useDefaultIcon) {
                customIcon = (<IconAdapter alt="icon" src={this.getDefaultIcon()} style={{height: '100%'}}/>);
            } else {
                customIcon = (<IconNote className={clsGeneric.iconStyle}/>);
            }
            return SmartGeneric.renderIcon(customIcon);
        }
    }

    onButton(id) {
        this.props.onControl(id, true);
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        // remove doubleSize from list
        settings.forEach((item, i) => {
            if (item.name === 'doubleSize') {
                settings.splice(i, 1);
                return false
            }
        });

        if (this.ids.buttons.stop) {
            settings.unshift({
                name: 'showStop',
                value: this.state.settings.showStop || false,
                type: 'boolean'
            });
        }
        return settings;
    }

    getControlsDiv() {
        return (<div key={this.key + 'tile-control'} style={style.control.div}>
            <div style={style.control.name} title={this.state.settings.name}>{this.state.settings.name}</div>
           {this.ids.buttons.prev ? <Fab size="small" onClick={() => this.onButton(this.ids.buttons.prev)} style={style.control.prev} aria-label="prev"><IconPrev/></Fab> : null}
            <Fab
                size="small"
                onClick={() => this.onButton(this.state[this.id] ? this.ids.buttons.pause : this.ids.buttons.play)}
                style={this.state[this.id] ? style.control.pause : style.control.play} aria-label="play pause">
                {this.state[this.id] ? <IconPause/> : <IconPlay/>}
            </Fab>
            {this.state.settings.showStop && this.ids.buttons.stop ? <Fab size="small" onClick={() => this.onButton(this.ids.buttons.stop)} style={style.control.stop} aria-label="stop"><IconStop/></Fab> : null}
            {this.ids.buttons.next ? <Fab size="small" onClick={() => this.onButton(this.ids.buttons.next)} style={style.control.prev} aria-label="next"><IconNext/></Fab> : null}
        </div>);
    }

    getInfoDiv() {
        return <div key={this.key + 'tile-info'} style={style.info.div}>
            {this.ids.info.artist && this.state[this.ids.info.artist] ? <div style={style.info.artist}>{this.state[this.ids.info.artist]}</div> : null}
            {this.ids.info.album  && this.state[this.ids.info.album]  ? <div style={style.info.album}>{this.state[this.ids.info.album]}</div>   : null}
            {this.ids.info.title  && this.state[this.ids.info.title]  ? <div style={style.info.title}>{this.state[this.ids.info.title]}</div>   : null}
        </div>;
    }

    render() {
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            this.getInfoDiv(),
            this.getControlsDiv(),
            this.state.showDialog ?
                <Dialog
                    dialogKey={this.key + 'dialog'}
                    open={true}
                    key={this.key + 'dialog'}
                    name={this.state.settings.name}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    onCollectIds={this.props.onCollectIds}
                    ids={this.ids}
                    windowWidth={this.props.windowWidth}
                    onControl={this.props.onControl}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default SmartMedia;

