import React from 'react';
import SmartGeneric from './SmartGeneric';
import Button from '@material-ui/core/Button';

import IconNote from 'react-icons/lib/md/music-note';
import IconPlay from 'react-icons/lib/md/play-arrow';
import IconPause from 'react-icons/lib/md/pause';
import IconStop from 'react-icons/lib/md/stop';
import IconNext from 'react-icons/lib/md/skip-next';
import IconPrev from 'react-icons/lib/md/skip-previous';

import Theme from '../theme';
// import cover from '../assets/cover.png';
import Dialog from './SmartDialogMedia';

const style = {
    info: {
        div: {
            background: 'rgba(0,0,0,0.55)',
            position: 'absolute',
            bottom: 50,
            width: 'calc(100% + 1em)',
            left: '-0.5em',
            paddingLeft: '1.2em'
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
            width: 'calc(100% + 1em)',
            bottom: 0,
            left: '-0.5em',
            height: 48,
            textAlign: 'center',
            lineHeight: '48px',
            verticalAlign: 'middle'
        },
        prev: {
            height: 32,
            width: 32,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(0,0,0,0)'
        },
        next: {
            height: 32,
            width: 32,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(0,0,0,0)'
        },
        stop: {
            height: 32,
            width: 32,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(0,0,0,0)'
        },
        play: {

        },
        pause: {
            background: '#40EE40'
        },
        name: {
            position: 'absolute',
            left: '1.2em',
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
            this.ids.volume.actual = state && state.id;

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
            return (
                <div key={this.key + 'icon'} style={Theme.tile.tileIcon} className="tile-icon">
                    <IconNote width={'100%'} height={'100%'}/>
                </div>
            );
        }
    }

    onButton(id) {
        this.props.onControl(id, true);
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        if (this.ids.buttons.stop) {
            settings.unshift({
                name: 'showStop',
                value: this.state.settings.showStop || false,
                type: 'boolean'
            });
        }
    }

    getControlsDiv() {
        return (<div key={this.key + 'tile-control'} style={style.control.div}>
            <div style={style.control.name}>{this.state.settings.name}</div>
           {this.ids.buttons.prev ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.prev)} style={style.control.prev} aria-label="prev"><IconPrev/></Button>) : null}
            <Button variant="fab" mini
                    onClick={() => this.onButton(this.state[this.id] ? this.ids.buttons.pause : this.ids.buttons.play)}
                    style={this.state[this.id] ? style.control.pause : style.control.play} aria-label="play pause">
                {this.state[this.id] ? (<IconPause/>) : (<IconPlay/>)}
            </Button>
            {this.state.settings.showStop && this.ids.buttons.stop ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.stop)} style={style.control.stop} aria-label="stop"><IconStop/></Button>) : null}
            {this.ids.buttons.next ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.next)} style={style.control.prev} aria-label="netx"><IconNext/></Button>) : null}
        </div>);
    }

    getInfoDiv() {
        return (<div key={this.key + 'tile-info'} style={style.info.div}>
            {this.ids.info.artist && this.state[this.ids.info.artist] ? (<div style={style.info.artist}>{this.state[this.ids.info.artist]}</div>) : null}
            {this.ids.info.album  && this.state[this.ids.info.album]  ? (<div style={style.info.album}>{this.state[this.ids.info.album]}</div>) : null}
            {this.ids.info.title  && this.state[this.ids.info.title]  ? (<div style={style.info.title}>{this.state[this.ids.info.title]}</div>) : null}
        </div>);
    }

    render() {
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            this.getInfoDiv(),
            this.getControlsDiv(),
            this.state.showDialog ?
                <Dialog dialogKey={this.key + 'dialog'}
                        key={this.key + 'dialog'}
                        name={this.state.settings.name}
                        enumNames={this.props.enumNames}
                        settings={this.state.settings}
                        onCollectIds={this.props.onCollectIds}
                        ids={this.ids}
                        windowWidth={this.props.windowWidth}
                        onControl={this.props.onControl}
                        onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default SmartMedia;

