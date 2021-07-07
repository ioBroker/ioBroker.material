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
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from "@material-ui/core/styles";

import Fab from '@material-ui/core/Fab';

import { MdVolumeMute as IconVolume0 } from 'react-icons/md';
import { MdVolumeUp as IconVolume100 } from 'react-icons/md';

import I18n from '@iobroker/adapter-react/i18n';

import SmartDialogGeneric from './SmartDialogGeneric';
import KnobControl from '../basic-controls/react-knob/KnobControl';
import cls from './style.module.scss';

const styles = theme => ({
    dialogPaper: {
        maxHeight: 360,
    },
    buttonMuteStyle: {
        position: 'absolute',
        left: 'calc(50% + 8em)',
        top: '16.5em',
        height: '2em',
        width: '2.5em',
        background: '-webkit-gradient(linear, left bottom, left top, color-stop(0, #1d1d1d), color-stop(1, #131313))',
        boxShadow: '0 0.2em 0.1em 0.05em rgba(255, 255, 255, 0.1) inset, 0 -0.2em 0.1em 0.05em rgba(0, 0, 0, 0.5) inset, 0 0.5em 0.65em 0 rgba(0, 0, 0, 0.3)',
        color: 'rgb(99, 99, 99)',
        textShadow: '0 0 0.3em rgba(23,23,23)'
    },
    buttonMuted: {
        color: '#a8d8f8'
    },
    knobControl: {
        left: 'calc(50% - 6em)',
        // marginTop: '2em',
        width: '12em',
        height: '12em',
        position: 'absolute'
    }
});

class SmartDialogKnob extends SmartDialogGeneric {
    constructor(props) {
        super(props);
        this.maxHeight = 400;
        this.stateRx.value = this.externalValue2localValue(this.props.startValue || 0);
        this.stateRx.muteValue = this.props.startMuteValue || false;

        this.dialogStyle = { // used in generic
            background: 'rgba(136,136,136,0.8)',
            maxHeight: 412,
            minHeight: 280,
        };

        this.closeOnPaperClick = true; // used in generic

        this.componentReady();
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed;
        if (props.startValue !== state.value) {
            newState.value = props.startValue;
            changed = true;
        }
        if (props.startMuteValue !== undefined && props.startMuteValue !== state.muteValue) {
            newState.muteValue = props.startMuteValue;
            changed = true;
        }
        return changed ? newState : null;
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

    onValueChanged = value => {
        this.click = Date.now();

        this.setState({ value: this.externalValue2localValue(value) });
        if (this.controlTimer) {
            clearTimeout(this.controlTimer);
        }

        if (this.props.onValueChange) {
            this.controlTimer = setTimeout(val => {
                this.controlTimer = null;
                this.props.onValueChange(Math.round(val));
            }, 300, value);
        }
    }

    onMute = e => {
        e && e.preventDefault();
        e && e.stopPropagation();
        this.props.onMute && this.props.onMute();
    }

    getMuteButton() {
        if (!this.props.onMute) {
            return null;
        }

        return <Fab
            key={this.props.dialogKey + '-mute-button'}
            color="primary"
            aria-label="mute"
            title={this.state.muteValue ? I18n.t('unmute') : I18n.t('mute')}
            onClick={this.onMute}
            className={clsx(this.props.classes.buttonMuteStyle, this.state.muteValue && this.props.classes.buttonMuted)}>
            {this.state.muteValue ? <IconVolume0 /> : <IconVolume100 />}
        </Fab>;
    }

    generateContent() {
        return <div className={cls.wrapperKnob}>
            <KnobControl
                className={cls.knobControl}
                value={this.localValue2externalValue(this.state.value)}
                onChange={this.onValueChanged}
                parent={this}
            />
            {this.getMuteButton()}
        </div>
    }
}

SmartDialogKnob.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string,
    windowWidth: PropTypes.number,

    onClose: PropTypes.func,

    onMute: PropTypes.func,

    onValueChange: PropTypes.func,
    startValue: PropTypes.number,
    startMuteValue: PropTypes.bool,
    type: PropTypes.number
};


export default withStyles(styles)(SmartDialogKnob);
