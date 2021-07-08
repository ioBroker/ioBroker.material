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
import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import I18n from '@iobroker/adapter-react/i18n';

import SmartDialogGeneric from './SmartDialogGeneric';
import ThermostatControl from '../basic-controls/react-nest-thermostat/src/react-nest-thermostat';
import cls from './style.module.scss';
import { ButtonGroup, FormControl, FormLabel } from '@material-ui/core';
import CustomButton from '../States/components/CustomButton';
import StateIcon from '../States/components/StateIcon';
import CustomMode from '../States/components/CustomMode';

const styles = themes => ({
    dialogPaper: {
        maxHeight: 430,
    },
    root: {
        width: 'calc(100% - 1em)',
        maxWidth: 400,
        maxHeight: 400,
        margin: 'auto',
        height: '100%'
    }
});

class SmartDialogThermostat extends SmartDialogGeneric {
    static buttonBoostStyle = {
        position: 'absolute',
        left: 'calc(50% - 2em)',
        height: '1.3em',
        width: '4em',
        borderRadius: '1em',
        background: 'white',
        border: '1px solid #b5b5b5',
        paddingTop: '0.1em',
        fontSize: '2em',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
    };
    // expected:
    // startValue
    // actualValue
    // onValueChange
    // onClose
    // objects
    // states
    constructor(props) {
        super(props);
        this.stateRx.value = props.startValue || 0;
        this.stateRx.boostValue = props.boostValue;

        this.step = props.step || 0.5;
        this.min = props.min;
        if (this.min > props.actualValue) {
            this.min = props.actualValue;
        }
        if (this.min > props.startValue) {
            this.min = props.startValue;
        }
        this.max = props.max;
        if (this.max < props.actualValue) {
            this.max = props.actualValue;
        }
        if (this.max < props.startValue) {
            this.max = props.startValue;
        }

        this.refPanel = React.createRef();
        this.svgControl = null;
        this.componentReady();
    }

    componentDidMount() {
        // document.getElementById('root').className = `blurDialogOpen`;
        this.initMouseHandlers();
    }

    initMouseHandlers(second) {
        let panel = this.refPanel.current;

        if (!panel) {
            panel = document.getElementsByClassName('paper-thermostat');
            if (panel && panel.length) {
                panel = panel[0];
            } else {
                panel = null;
            }
            if (!panel && !second) {
                setTimeout(() => this.initMouseHandlers(true), 100);
            }
        }

        if (panel) {
            this.svgControl = panel.getElementsByTagName('svg')[0];
            this.svgWidth = this.svgControl.clientWidth;
            this.svgHeight = this.svgControl.clientHeight;
            this.svgCenterX = this.svgWidth / 2;
            this.svgCenterY = this.svgHeight / 2;
            this.svgRadius = this.svgCenterX > this.svgCenterY ? this.svgCenterY : this.svgCenterX;
            this.rect = this.svgControl.getBoundingClientRect();

            this.svgControl.addEventListener('mousedown', this.onMouseDown, { passive: false, capture: true });
            this.svgControl.addEventListener('touchstart', this.onMouseDown, { passive: false, capture: true });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        !this.svgControl && this.initMouseHandlers();
    }

    static roundValue(value, round) {
        round = round || 0.5;
        return Math.round(value / round) * round;
    }

    posToTemp(x, y) {
        let h;
        if (x < 0) {
            h = Math.atan2(y, -x) * 180 / Math.PI;
            if (y > 0) {
                h = 180 - h;
            } else {
                h = 180 - h;
            }
        } else {
            h = Math.atan2(y, x) * 180 / Math.PI;
        }
        h = h * -1;
        if (h < 0) h += 360;
        h = 360 - h;
        // owr sector
        // 60 => 100%
        // 120 => 0%
        // 270 => 50%
        if (h > 60 && h < 90) {
            h = 60;
        }
        if (h > 90 && h < 120) {
            h = 120;
        }
        if (h < 90) {
            h += 360;
        }
        h -= 120;
        h /= 360 - 60;
        return SmartDialogThermostat.roundValue((this.max - this.min) * h + this.min, this.step);
    }

    eventToValue(e, checkRadius) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.pageY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].clientX : e.pageX;
        const x = pageX - this.rect.left - this.svgCenterX;
        const y = pageY - this.rect.top - this.svgCenterY;
        if (checkRadius) {
            const radius = Math.sqrt(x * x + y * y);
            if (radius > this.svgRadius * 1.1) {
                return false;
            }
        }

        this.setState({ value: this.posToTemp(x, y) });

        return true;
    }

    onMouseMove = e => {
        e.preventDefault();
        e.stopPropagation();
        this.eventToValue(e);
    }

    onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();

        if (this.eventToValue(e, true)) {
            document.addEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
            document.addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
            document.addEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
            document.addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
        } else {
            this.onClose();
        }
    }

    onMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();
        this.click = Date.now();
        document.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });

        this.props.onValueChange && this.props.onValueChange(this.state.value);
    }

    onBoostMode = () => {
        this.props.onBoostToggle && this.props.onBoostToggle(!this.state.boostValue);
        this.setState({ boostValue: !this.state.boostValue });
    };

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <div className={cls.wrapperThermostat}>
                {this.state.boostValue !== null && this.state.boostValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Boost'} />}
                        active={this.state.boostValue}
                        onClick={this.onBoostMode}
                        className={cls.boostButton}>{I18n.t('Boost')}
                    </CustomButton> : null}
                {this.props.powerValue !== null && this.props.powerValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Power'} />}
                        active={this.props.powerValue}
                        onClick={this.props.onPowerToggle}
                        className={cls.powerButton}>
                        {I18n.t('Power')}
                    </CustomButton> : null}
                {this.props.partyValue !== null && this.props.partyValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Party'} />}
                        active={this.props.partyValue}
                        onClick={this.props.onPartyToggle}
                        className={cls.partyButton}>
                        {I18n.t('Party')}
                    </CustomButton> : null}
                {this.props.modeValue !== null && this.props.modeValue !== undefined ?
                    <CustomMode
                        label={I18n.t('Mode')}
                        objs={this.props.modeArray}
                        value={this.props.modeValue}
                        onChange={this.props.onMode}
                        className={cls.modeButton}
                    />
                    : null}
                {this.props.swingValue !== null && this.props.swingValue !== undefined ?
                    typeof this.props.swingValue === 'number' ?
                        <CustomMode
                            label={I18n.t('Swing')}
                            objs={this.props.swingArray}
                            value={this.props.swingValue}
                            onChange={this.props.onSwing}
                            className={cls.swingGroup}
                            orientation="vertical"
                        /> : <CustomButton
                            startIcon={<StateIcon type={'Swing'} />}
                            active={this.props.swingValue}
                            onClick={this.props.onSwing}
                            className={cls.swingButton}>
                            {I18n.t('Swing')}
                        </CustomButton>
                    : null}
                <div className={cls.charts}>
                    {this.props.humidityId && this.props.checkHistory(this.props.humidityId) && this.getCharts(this.props.checkHistory(this.props.humidityId), React.createRef())}
                    {this.props.actualId && this.props.checkHistory(this.props.actualId) && this.getCharts(this.props.checkHistory(this.props.actualId), React.createRef())}
                    {this.props.setId && this.props.checkHistory(this.props.setId) && this.getCharts(this.props.checkHistory(this.props.setId), React.createRef())}
                </div>
                <div ref={this.refPanel} className={cls.wrapperControl}>
                    <ThermostatControl
                        afterComma={1}
                        unit={this.props.unit}
                        commaAsDelimiter={this.props.commaAsDelimiter === undefined ? true : this.props.commaAsDelimiter}
                        minValue={this.min}
                        maxValue={this.max}
                        hvacMode={'heating'}
                        ambientTemperature={this.props.actualValue}
                        targetTemperature={this.state.value}
                    />
                </div>
            </div>
        </div>;
    }
}

SmartDialogThermostat.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string.isRequired,
    windowWidth: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    unit: PropTypes.string,
    step: PropTypes.number,
    commaAsDelimiter: PropTypes.bool,

    objects: PropTypes.object,
    states: PropTypes.object,
    onValueChange: PropTypes.func,
    startValue: PropTypes.number.isRequired,
    actualValue: PropTypes.number,
};

export default withStyles(styles)(SmartDialogThermostat);
