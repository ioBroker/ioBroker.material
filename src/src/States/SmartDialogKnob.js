import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

import IconVolume0 from 'react-icons/lib/md/volume-mute';
import IconVolume100 from 'react-icons/lib/md/volume-up';

import SmartDialogGeneric from './SmartDialogGeneric';
import KnobControl from '../basic-controls/react-knob/KnobControl';
import I18n from '../i18n';

class SmartDialogKnob extends SmartDialogGeneric  {
    // expected:

    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string,
        windowWidth:        PropTypes.number,

        onClose:            PropTypes.func,

        onMute:             PropTypes.func,

        onValueChange:      PropTypes.func,
        startValue:         PropTypes.number,
        startMuteValue:     PropTypes.bool,
        type:               PropTypes.number
    };

    static buttonMuteStyle = {
        position: 'absolute',
        left: 'calc(50% + 8em)',
        top: '16.5em',
        height: '2em',
        width: '2.5em',
        background: '-webkit-gradient(linear, left bottom, left top, color-stop(0, #1d1d1d), color-stop(1, #131313))',
        boxShadow: '0 0.2em 0.1em 0.05em rgba(255, 255, 255, 0.1) inset, 0 -0.2em 0.1em 0.05em rgba(0, 0, 0, 0.5) inset, 0 0.5em 0.65em 0 rgba(0, 0, 0, 0.3)',
        color: 'rgb(99, 99, 99)',
        textShadow: '0 0 0.3em rgba(23,23,23)'
    };

    static buttonMuted = {
        color: '#a8d8f8'
    };

    constructor(props) {
        super(props);
        this.stateRx.value     = this.externalValue2localValue(this.props.startValue || 0);
        this.stateRx.muteValue = this.props.startMuteValue || false;

        this.refSlider = React.createRef();

        this.button = {
            time: 0,
            name: '',
            timer: null,
            timeUp: 0
        };
        this.dialogStyle = {
            background: 'rgba(136,136,136,0.8)',
            maxHeight: 412,
            minHeight: 280,
        };

        this.closeOnPaperClick = true; // used in generic
        this.componentReady();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.startValue !== this.state.value) {
            this.setState({value: nextProps.startValue});
        }
        if (nextProps.startMuteValue !== undefined && nextProps.startMuteValue !== this.state.muteValue) {
            this.setState({muteValue: nextProps.startMuteValue});
        }
    }

    eventToValue(e) {
        const pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY;

        let value = 100 - Math.round((pageY - this.top) / this.height * 100);

        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        this.setState({value});
    }


    localValue2externalValue(value) {
        if (this.props.min !== undefined && this.props.max !== undefined) {
            return value * (this.props.max - this.props.min) / 100 + this.props.min;
        } else {
            return value;
        }
    }

    externalValue2localValue(value) {
        if (this.props.min !== undefined && this.props.max !== undefined) {
            return ((value - this.props.min) / (this.props.max - this.props.min)) * 100;
        } else {
            return value;
        }
    }

    onValueChanged(value) {
        this.click = Date.now();

        this.setState({value: this.externalValue2localValue(value)});
        this.props.onValueChange && this.props.onValueChange(Math.round(value));
    }

    onMute(e) {
        e && e.preventDefault();
        e && e.stopPropagation();
        this.props.onMute && this.props.onMute();
    }

    getMuteButton() {
        if (!this.props.onMute) return null;
        const style = Object.assign(
            {},
            SmartDialogKnob.buttonMuteStyle,
            this.state.muteValue ? SmartDialogKnob.buttonMuted : {});
        return (
           <Button key={this.props.dialogKey + '-mute-button'}
                     variant="fab"
                     color="primary"
                     aria-label="mute"
                     title={this.state.muteValue ? I18n.t('unmute') : I18n.t('mute')}
                     style={style}
                     onClick={this.onMute.bind(this)}
                     className="mute-button">
               {this.state.muteValue ? (<IconVolume0/>) : (<IconVolume100/>)}
           </Button>);
    }

    generateContent() {
        return [
            (<KnobControl
                    style={{left: 'calc(50% - 6em)', marginTop: '2em', width: '12em', height: '12em', position: 'absolute'}}
                value={this.localValue2externalValue(this.state.value)}
                onChange={this.onValueChanged.bind(this)}
                parent={this}
            />),
            this.getMuteButton()
        ];
    }
}

export default SmartDialogKnob;