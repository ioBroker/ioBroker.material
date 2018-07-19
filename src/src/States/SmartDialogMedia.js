import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';

import IconNote from 'react-icons/lib/md/music-note';
import IconPlay from 'react-icons/lib/md/play-arrow';
import IconPause from 'react-icons/lib/md/pause';
import IconStop from 'react-icons/lib/md/stop';
import IconNext from 'react-icons/lib/md/skip-next';
import IconPrev from 'react-icons/lib/md/skip-previous';

import IconShuffle from 'react-icons/lib/md/shuffle';
import IconRepeatAll from 'react-icons/lib/md/repeat';
import IconRepeatOne from 'react-icons/lib/md/repeat-one';
import IconVolume100 from "react-icons/lib/md/volume-up";
import IconVolume0 from "react-icons/lib/md/volume-mute";

import Utils from '../Utils';
import SmartDialogGeneric from './SmartDialogGeneric';
import I18n from "../i18n";
//import cover from '../assets/cover.png';

const HEIGHT_HEADER = 48;
const HEIGHT_VOLUME = 48;
const HEIGHT_COVER = 365;
const HEIGHT_INFO = 88;
const HEIGHT_CONTROL = 48;
const HEIGHT_TIME = 48;

const REPEAT = {
    NONE: 0,
    ALL: 1,
    ONE: 2
};

const styles = {
    info: {
        div: {
            zIndex: 1,
            background: 'rgba(0,0,0,0.55)',
            position: 'absolute',
            bottom: 100,
            width: 'calc(100% + 1em)',
            left: '-0.5em',
            padding: '1.2em',
        },
        artist: {
            fontSize: 14,
            fontWeight: 'normal',
            color: 'white'
        },
        album: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'white'
        },
        title: {
            fontSize: 14,
            fontWeight: 'normal',
            color: 'white'
        }
    },
    control: {
        div: {
            zIndex: 1,
            background: 'rgba(255,255,255,0.9)',
            position: 'absolute',
            width: 'calc(100% + 1em)',
            bottom: 48,
            left: '-0.5em',
            height: HEIGHT_CONTROL,
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
        repeat: {
            position: 'absolute',
            top: 5,
            right: 54,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(0,0,0,0)',
            float: 'right'
        },
        shuffle: {
            position: 'absolute',
            top: 5,
            right: 12,
            verticalAlign: 'middle',
            boxShadow: 'none',
            background: 'rgba(0,0,0,0)',
            float: 'right'
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
            zIndex: 1,
            background: 'rgba(255,255,255,0.9)',
            position: 'absolute',
            width: 'calc(100% + 1em)',
            bottom: 0,
            left: '-0.5em',
            height: HEIGHT_TIME,
            lineHeight: '48px',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'rgba(0,0,0,0.9)'
        },
        elapsed: {
            display: 'inline-block',
            float: 'left',
            paddingLeft: '1.2em'
        },
        slider: {
            display: 'inline-block',
            width: 'calc(100% - 10em)',
            verticalAlign: 'middle',
        },
        duration: {
            display: 'inline-block',
            float: 'right',
            paddingRight: '1.2em'
        }
    },
    volume: {
        div: {
            zIndex: 1,
            background: 'rgba(255,255,255,0.9)',
            position: 'absolute',
            width: 'calc(100% + 1em)',
            bottom: 0,
            left: '-0.5em',
            height: HEIGHT_TIME,
            lineHeight: '48px',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'rgba(0,0,0,0.9)'
        },
        mute: {
            display: 'inline-block',
            position: 'absolute',
            left: '1.5em',
            top: 4,
            boxShadow: 'none'
        },
        slider: {
            display: 'inline-block',
            width: 'calc(100% - 10em)',
            verticalAlign: 'middle',
        }
    },
    cover: {
        div: {
            position: 'absolute',
            top: 48,
            width: 'calc(100% - 2em)',
            height: 'calc(100% - 2em)',
            maxHeight: HEIGHT_COVER,
            zIndex: 0,
            backgroundSize: '100% auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
        },
        img: {
            width: '100%',
            height: 'auto'
        }
    },
    header: {
        div: {
            position: 'absolute',
            fontSize: 16,
            height: HEIGHT_HEADER -16,
            zIndex: 1,
            paddingTop: 16
        }
    }
};

class SmartDialogMedia extends SmartDialogGeneric  {
    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string.isRequired,
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        objects:            PropTypes.object,
        states:             PropTypes.object,
        onCollectIds:       PropTypes.func,
        enumNames:          PropTypes.array,
        onControl:          PropTypes.func,
        ids:                PropTypes.object.isRequired,
        settings:           PropTypes.object
    };

    constructor(props) {
        super(props);

        this.ids = this.props.ids;

        for (const type in this.ids) {
            if (this.ids.hasOwnProperty(type) && type !== 'buttons') {
                for (const id in this.ids[type]) {
                    if (this.ids[type].hasOwnProperty(id)) {
                        this.subscribes = this.subscribes || [];
                        this.subscribes.push(this.ids[type][id]);
                    }
                }
            }
        }
        let maxHeight = 0;

        this.divs = {
            'header':  {height: HEIGHT_HEADER,  position: 'top',    visible: true},
            'volume':  {height: HEIGHT_VOLUME,  position: 'top',    visible: this.ids.volume.set},
            'cover':   {height: HEIGHT_COVER,   position: 'top',    visible: this.ids.info.cover},
            'info':    {height: HEIGHT_INFO,    position: 'bottom', visible: this.ids.info.artist || this.ids.info.album || this.ids.info.title},
            'control': {height: HEIGHT_CONTROL, position: 'bottom', visible: true},
            'time':    {height: HEIGHT_TIME,    position: 'bottom', visible: this.ids.control.elapsed || this.ids.control.duration || this.ids.control.seek},
        };
        // calculate positions
        let top = 0;
        let bottom = 0;
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                maxHeight += this.divs[name].height;
                if (this.divs[name].position === 'top') {
                    this.divs[name].points = top;
                    top += this.divs[name].height;
                }
            }
        }
        const keys = Object.keys(this.divs);
        for (let j = keys.length - 1; j >= 0; j--) {
            if (this.divs[keys[j]].visible && this.divs[keys[j]].position === 'bottom') {
                this.divs[keys[j]].points = bottom;
                bottom += this.divs[keys[j]].height;
            }
        }
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                this.divs[name].style = Object.assign({}, styles[name].div, {[this.divs[name].position] : this.divs[name].points});
            }
        }

        this.dialogStyle = {
            maxHeight: maxHeight
        };

        const enums = [];
        this.props.enumNames.forEach(e => (enums.indexOf(e) === -1) && enums.push(e));
        if (enums.indexOf(this.props.name) === -1) {
            enums.push(this.props.name);
        }
        this.name = enums.join(' / ');
        this.collectState = null;
        this.collectTimer = null;

        this.volumeTimer = null;
        this.seekTimer   = null;

        this.refDialog = React.createRef();

        this.componentReady();
    }

    onSeek(value) {
        if (value !== this.state[this.ids.control.seek]){
            this.setState({[this.ids.control.seek]: value});

            if (this.seekTimer) {
                clearTimeout(this.seekTimer);
            }
            this.seekTimer = setTimeout((_value) => {
                this.seekTimer = null;
                this.props.onControl(this.ids.control.seek, _value);
            }, 400, value);
        }
    }

    onVolume(value) {
        if (value !== this.state[this.ids.volume.actual]){
            this.setState({[this.ids.volume.actual]: value});

            if (this.volumeTimer) {
                clearTimeout(this.volumeTimer);
            }
            this.volumeTimer = setTimeout((_value) => {
                this.volumeTimer = null;
                this.props.onControl(this.ids.volume.set, _value);
            }, 400, value);
        }
    }

    onToggleMute() {
        this.props.onControl(this.ids.volume.mute, !this.state[this.ids.volume.mute]);
    }

    onShuffle() {
        this.props.onControl(this.ids.mode.shuffle, !this.state[this.ids.mode.shuffle]);
    }

    onRepeat() {
        this.props.onControl(this.ids.mode.repeat, (this.state[this.ids.mode.repeat] + 1) % 3);
    }

    onUpdateTimer() {
        this.collectTimer = null;
        if (this.collectState) {
            this.setState(this.collectState);
            this.collectState = null;
        }
    }

    updateState(id, state) {
        if (id === this.ids.info.cover) {
            this.collectState = this.collectState || {};
            let url = state && state.val;
            if (url) {
                //url = cover;
                if (url.match(/\?.+$/)) {
                    url += '&ts=' + Date.now();
                } else {
                    url += '?ts=' + Date.now();
                }
            }
            this.setState({[id]: url});
        } else
        if (id === this.ids.control.elapsed ||
            id === this.ids.control.seek ||
            id === this.ids.control.duration ||
            id === this.ids.volume.set ||
            id === this.ids.volume.actual) {
            this.collectState = this.collectState || {};
            this.collectState[id] = parseFloat(state.val);
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (id === this.ids.info.album || id === this.ids.info.artist || id === this.ids.info.title) {
            this.collectState = this.collectState || {};
            this.collectState[id] = state.val;
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        }  else
        if (id === this.ids.volume.mute || id === this.ids.mode.shuffle) {
            this.collectState = this.collectState || {};

            this.collectState[id] =
                state.val === 'true' ||
                state.val === true ||
                state.val === 'mute' ||
                state.val === 'shuffle' ||
                state.val === 'muted' ||
                state.val === 1 ||
                state.val === '1';

            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (id === this.ids.mode.repeat) {
            this.collectState = this.collectState || {};
            let val;
            if (state.val === true || state.val === 'true') {
                val = REPEAT.ALL;
            } else if (state.val === 'false' || state.val === false) {
                val = REPEAT.NONE;
            } else if (state.val === 'all' || state.val === 'ALL' || state.val === 1 || state.val === '1') {
                val = REPEAT.ALL;
            } else if (state.val === 'one' || state.val === 'ONE' || state.val === 2 || state.val === '2') {
                val = REPEAT.ONE;
            } else {
                val = REPEAT.NONE;
            }
            this.collectState[id] = val;
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (this.ids.control.state === id && state.ack) {
            const val =
                state.val === 'true' ||
                state.val === true ||
                state.val === 'PLAY' ||
                state.val === 'play' ||
                state.val === 1 ||
                state.val === '1';
            this.collectState = this.collectState || {};
            this.collectState[id] = val;

            if (state.ack && this.state.executing) {
                this.collectState.executing = false;
            }
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else {
            super.updateState(id, state);
        }
    }

    onButton(id) {
        this.props.onControl(id, true);
    }

    getVolumeSlider() {
        if (this.ids.volume.set) {
            return (<Slider value={this.state[this.ids.volume.actual] || 0} style={styles.volume.slider} onChange={(event, value) => this.onVolume(value)} />);
        } else if (this.ids.volume.actual) {
            return (<Slider value={this.state[this.ids.volume.actual] || 0} style={styles.volume.slider} disabled />);
        } else {
            return null;
        }
    }

    getMute() {
        if (!this.ids.volume.mute) return null;
        let Icon;
        let text;
        let background;
        let color;
        let title;

        if (this.state[this.ids.volume.mute]) {
            Icon = IconVolume0;
            text = I18n.t('mute');
            background = '#f50057';
            color = 'white';
            title = I18n.t('muted');
        } else {
            Icon = IconVolume100;
            text = I18n.t('unmute');
            background = 'inherit';
            color = 'black';
            title = I18n.t('unmuted');
        }

        return (
            <Button variant="fab" mini
                    title={title}
                    onClick={this.onToggleMute.bind(this)}
                    style={Object.assign({}, styles.volume.mute, {background, color})}
                    aria-label={text}>
                <Icon />
            </Button>
        );
    }

    getVolumeDiv() {
        if (!this.divs.volume.visible) return null;

        return (
            <div key={this.key + 'tile-volume'} style={this.divs.volume.style}>
                {this.getMute()}
                {this.getVolumeSlider()}
            </div>
        );
    }

    getSlider() {
        if (this.ids.control.seek) {
            return (<Slider value={this.state[this.ids.control.seek] || 0} style={styles.time.slider} onChange={(event, value) => this.onSeek(value)} />);
        } else if (this.ids.control.elapsed && this.ids.control.duration && this.state[this.ids.control.duration]) {
            const value = Math.round(this.state[this.ids.control.elapsed] / this.state[this.ids.control.duration] * 100);
            return (<Slider value={value || 0} disabled style={styles.time.slider} />);
        } else {
            return null;
        }
    }

    getTimeDiv() {
        if (!this.divs.time.visible) return null;
        return (
            <div key={this.key + 'tile-time'} style={this.divs.time.style}>
                {this.ids.control.elapsed ? (<div style={styles.time.elapsed}>{Utils.getTimeString(this.state[this.ids.control.elapsed])}</div>) : null}
                {this.getSlider()}
                {this.ids.control.duration  ? (<div style={styles.time.duration}>{Utils.getTimeString(this.state[this.ids.control.duration])}</div>) : null}
            </div>
        );
    }

    getRepeat() {
        if (!this.ids.mode.repeat) return null;
        let style;
        let title;
        if (this.state[this.ids.mode.repeat]) {
            style = Object.assign({}, styles.control.repeat, {background: 'rgb(64, 238, 64)', color: 'white'});
        } else {
            style = styles.control.repeat;
            title = I18n.t('No repeat');
        }
        let Icon;
        if (this.state[this.ids.mode.repeat] === REPEAT.NONE || this.state[this.ids.mode.repeat] === REPEAT.ALL) {
            title = title || I18n.t('Repeat mode: all');
            Icon = IconRepeatAll;
        } else {
            Icon = IconRepeatOne;
            title = title || I18n.t('Repeat mode: one');
        }

        return (<Button variant="fab" mini onClick={() => this.onRepeat()}  style={style} title={title} aria-label="repeat">
            <Icon/>
        </Button>);
    }

    getShuffle() {
        if (!this.ids.mode.shuffle) return null;
        let style;
        if (this.state[this.ids.mode.shuffle]) {
            style = Object.assign({}, styles.control.shuffle, {background: '#b6b6f3'});
        } else {
            style = styles.control.shuffle;
        }

        return (<Button variant="fab" mini onClick={() => this.onShuffle()} title={I18n.t('Shuffle mode')} style={style} aria-label="shuffle">
            <IconShuffle/>
        </Button>);

    }

    getControlsDiv() {
        const state = this.state[this.ids.control.state];
        return (<div key={this.key + 'tile-control'} style={this.divs.control.style}>
            {this.ids.buttons.prev ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.prev)} style={styles.control.prev} aria-label="prev"><IconPrev/></Button>) : null}
            <Button variant="fab" mini
                    color={state ? 'primary' : 'secondary'}
                    onClick={() => this.onButton(this.state[this.ids.control.state] ? this.ids.buttons.pause : this.ids.buttons.play)}
                    style={state ? styles.control.pause : styles.control.play} aria-label="play pause">
                {state ? (<IconPause/>) : (<IconPlay/>)}
            </Button>
            {this.props.settings.showStop && this.ids.buttons.stop ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.stop)} style={styles.control.stop} aria-label="stop"><IconStop/></Button>) : null}
            {this.ids.buttons.next ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.next)} style={styles.control.prev} aria-label="next"><IconNext/></Button>) : null}
            {this.getShuffle()}
            {this.getRepeat()}
       </div>);
    }

    getInfoDiv() {
        if (!this.divs.info.visible) return null;

        return (<div key={this.key + 'tile-info'} style={this.divs.info.style}>
            {this.ids.info.artist && this.state[this.ids.info.artist] ? (<div style={styles.info.artist}>{this.state[this.ids.info.artist]}</div>) : null}
            {this.ids.info.album  && this.state[this.ids.info.album]  ? (<div style={styles.info.album}>{this.state[this.ids.info.album]}</div>) : null}
            {this.ids.info.title  && this.state[this.ids.info.title]  ? (<div style={styles.info.title}>{this.state[this.ids.info.title]}</div>) : null}
        </div>);
    }

    getCoverDiv() {
        if (!this.divs.cover.visible) return null;

        if (this.state[this.ids.info.cover]) {
            const style = Object.assign({}, this.divs.cover.style, {backgroundImage: 'url(' + this.state[this.ids.info.cover] + ')'});
            return (<div style={style}/>);
        } else {
            return (
                <div style={this.divs.cover.style}>
                    <div key={this.key + 'icon'} style={styles.cover.img}>
                        <IconNote width={'100%'} height={'100%'}/>
                    </div>
                </div>
            );
        }
    }

    getHeaderDiv() {
        if (!this.divs.header.visible) return null;
        return (<div style={this.divs.header.style}>{this.name}</div>);
    }

    generateContent() {
        return [
            this.getHeaderDiv(),
            this.getVolumeDiv(),
            this.getCoverDiv(),
            this.getInfoDiv(),
            this.getTimeDiv(),
            this.getControlsDiv()
        ];
    }
}

export default SmartDialogMedia;