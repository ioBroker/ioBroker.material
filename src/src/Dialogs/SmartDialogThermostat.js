/**
 * Copyright 2018-2020 bluefox <dogafox@gmail.com>
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
import I18n from '../i18n';
import ThermostatControl from '../basic-controls/react-nest-thermostat/src/react-nest-thermostat';
import Button from '@material-ui/core/Button';
import SmartDialogGeneric from './SmartDialogGeneric';

class SmartDialogThermostat extends SmartDialogGeneric  {
    // expected:

    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string.isRequired,
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        unit:               PropTypes.string,
        step:               PropTypes.number,
        commaAsDelimiter:   PropTypes.bool,

        objects:            PropTypes.object,
        states:             PropTypes.object,
        onValueChange:      PropTypes.func,
        startValue:         PropTypes.number.isRequired,
        actualValue:        PropTypes.number,
    };

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
            this.min = props.actualValue
        }
        if (this.min > props.startValue) {
            this.min = props.startValue
        }
        this.max = props.max;
        if (this.max < props.actualValue) {
            this.max = props.actualValue
        }
        if (this.max < props.startValue) {
            this.max = props.startValue
        }

        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind   = this.onMouseUp.bind(this);
        this.onMouseDownBind = this.onMouseDown.bind(this);

        this.refPanel = React.createRef();
        this.svgControl = null;
        this.componentReady();
    }

    componentDidMount() {
        super.componentDidMount();
        this.svgControl = this.refPanel.current.getElementsByTagName('svg')[0];
        this.svgWidth   = this.svgControl.clientWidth;
        this.svgHeight  = this.svgControl.clientHeight;
        this.svgCenterX = this.svgWidth / 2;
        this.svgCenterY = this.svgHeight / 2;
        this.svgRadius  = this.svgCenterX > this.svgCenterY ? this.svgCenterY : this.svgCenterX;
        this.rect       = this.svgControl.getBoundingClientRect();

        this.svgControl.addEventListener('mousedown', this.onMouseDownBind, {passive: false, capture: true});
        this.svgControl.addEventListener('touchstart', this.onMouseDownBind, {passive: false, capture: true});
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
            } else{
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

        this.setState({value: this.posToTemp(x, y)});

        return true;
    }

    onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        this.eventToValue(e);
    }

    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.eventToValue(e, true)) {
            document.addEventListener('mousemove',  this.onMouseMoveBind,   {passive: false, capture: true});
            document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
            document.addEventListener('touchmove',  this.onMouseMoveBind,   {passive: false, capture: true});
            document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
        } else {
            this.onClose();
        }
    }

    onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.click = Date.now();
        document.removeEventListener('mousemove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchmove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});

        this.props.onValueChange && this.props.onValueChange(this.state.value);
    }

    onBoostMode() {
        this.props.onBoostToggle && this.props.onBoostToggle(!this.state.boostValue);
        this.setState({boostValue: !this.state.boostValue});
    }

    generateContent() {
        return (<div ref={this.refPanel} style={{width: 'calc(100% - 1em)', height: '100%'}}>
            {this.state.boostValue !== null && this.state.boostValue !== undefined ?
                (<Button variant="contained" color={this.state.boostValue ? 'secondary' : ''} onClick={this.onBoostMode.bind(this)}
                         style={{top: '1.3em'}}
                         className="boost-button">{I18n.t('Boost')}
                </Button>) : null}
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
        </div>);
    }
}

export default SmartDialogThermostat;
