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

import Utils from '../Utils';
import SmartDialogGeneric from './SmartDialogGeneric';
// import cover from '../assets/cover.png';

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
            zIndex: 1,
            background: 'rgba(255,255,255,0.9)',
            position: 'absolute',
            width: 'calc(100% + 1em)',
            bottom: 0,
            left: '-0.5em',
            height: 48,
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
    cover: {
        div: {
            position: 'absolute',
            top: 48,
            width: 'calc(100% - 2em)',
            height: 'calc(100% - 2em)',
            maxHeight: 360,
            zIndex: 0,
            backgroundSize: '100% auto',
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
            height: 48,
            zIndex: 1
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

        for (const type in this.props.ids) {
            if (this.props.ids.hasOwnProperty(type) && type !== 'buttons') {
                for (const id in this.props.ids[type]) {
                    if (this.props.ids[type].hasOwnProperty(id)) {
                        this.subscribes = this.subscribes || [];
                        this.subscribes.push(this.props.ids[type][id]);
                    }
                }
            }
        }

        this.dialogStyle = {
            maxHeight: 610
        };
        this.ids = this.props.ids;

        const enums = [];
        this.props.enumNames.forEach(e => (enums.indexOf(e) === -1) && enums.push(e));
        if (enums.indexOf(this.props.name) === -1) {
            enums.push(this.props.name);
        }
        this.name = enums.join(' / ');
        this.collectState = null;
        this.collectTimer = null;
        this.sliderVisible = this.ids.control.elapsed || this.ids.control.duration || this.ids.control.seek;

        this.refDialog = React.createRef();

        this.componentReady();
    }

    onSeek(value) {
        if (value !== this.state[this.ids.control.seek]){
            this.setState({[this.ids.control.seek]: value});

            if (this.seekTimer) {
                clearTimeout(this.seekTimer);
                this.seekTimer = setTimeout((_value) => {
                    this.seekTimer = null;
                    this.props.onControl(this.ids.control.seek, _value);
                }, 400, value);
            }
        }
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
                // url = cover;
                if (url.match(/\?.+$/)) {
                    url += '&ts=' + Date.now();
                } else {
                    url += '?ts=' + Date.now();
                }
            }
            this.setState({[id]: url});
        } else
        if (id === this.ids.control.elapsed || id === this.ids.control.seek || id === this.ids.control.duration) {
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
        if (!this.sliderVisible) return null;
        return (
            <div key={this.key + 'tile-time'} style={styles.time.div}>
                {this.ids.control.elapsed ? (<div style={styles.time.elapsed}>{Utils.getTimeString(this.state[this.ids.control.elapsed])}</div>) : null}
                {this.getSlider()}
                {this.ids.control.duration  ? (<div style={styles.time.duration}>{Utils.getTimeString(this.state[this.ids.control.duration])}</div>) : null}
            </div>
        );
    }

    getControlsDiv() {
        const state = this.state[this.ids.control.state];
        const style = Object.assign({}, styles.control.div, !this.sliderVisible ? {bottom: 0} : {});
        return (<div key={this.key + 'tile-control'} style={style}>
            {this.ids.buttons.prev ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.prev)} style={styles.control.prev} aria-label="prev"><IconPrev/></Button>) : null}
            <Button variant="fab" mini
                    color={state ? 'primary' : 'secondary'}
                    onClick={() => this.onButton(this.state[this.ids.control.state] ? this.ids.buttons.pause : this.ids.buttons.play)}
                    style={state ? styles.control.pause : styles.control.play} aria-label="play pause">
                {state ? (<IconPause/>) : (<IconPlay/>)}
            </Button>
            {this.props.settings.showStop && this.ids.buttons.stop ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.stop)} style={styles.control.stop} aria-label="stop"><IconStop/></Button>) : null}
            {this.ids.buttons.next ? (<Button variant="fab" mini onClick={() => this.onButton(this.ids.buttons.next)} style={styles.control.prev} aria-label="netx"><IconNext/></Button>) : null}
        </div>);
    }

    getInfoDiv() {
        if (!this.ids.info.artist && !this.ids.info.album && !this.ids.info.title) return null;

        const style = Object.assign({}, styles.info.div, !this.sliderVisible ? {bottom: 50} : {});

        return (<div key={this.key + 'tile-info'} style={style}>
            {this.ids.info.artist && this.state[this.ids.info.artist] ? (<div style={styles.info.artist}>{this.state[this.ids.info.artist]}</div>) : null}
            {this.ids.info.album  && this.state[this.ids.info.album]  ? (<div style={styles.info.album}>{this.state[this.ids.info.album]}</div>) : null}
            {this.ids.info.title  && this.state[this.ids.info.title]  ? (<div style={styles.info.title}>{this.state[this.ids.info.title]}</div>) : null}
        </div>);
    }

    getCover() {
        if (this.state[this.ids.info.cover]) {
            const style = Object.assign({}, styles.cover.div, {backgroundImage: 'url(' + this.state[this.ids.info.cover] + ')'});
            return (
                <div style={style}/>);
        } else {
            return (
                <div style={styles.cover.div}>
                    (<div key={this.key + 'icon'} style={styles.cover.img}>
                        <IconNote width={'100%'} height={'100%'}/>
                    </div>)
                </div>
            );
        }
    }

    getHeader() {
        return (<div style={styles.header.div}>{this.name}</div>);
    }

    generateContent() {
        return [
            this.getHeader(),
            this.getCover(),
            this.getInfoDiv(),
            this.getTimeDiv(),
            this.getControlsDiv()
        ];
    }
}

export default SmartDialogMedia;