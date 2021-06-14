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
import SmartGeneric from '../SmartGeneric';
import Icon from '../../icons/Thermometer'
import IconThermometer from '../../icons/ThermometerSimple';
import IconHydro from '../../icons/Humidity';
import Theme from '../../theme';
import Dialog from '../../Dialogs/SmartDialogThermostat';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';

class SmartThermostat extends SmartGeneric {
    // props = {
    //    objects: OBJECT
    //    tile: parentDiv
    //    states: STATES
    //    onControl: function
    // };

    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
            } else {
                this.id = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'BOOST');
            this.boostId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'HUMIDITY');
            this.humidityId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'POWER');
            // debugger
            this.powerId = state && state.id;
        }

        if (this.humidityId) {
            const common = this.props.objects[this.humidityId] && this.props.objects[this.humidityId].common;
            this.humUnit = common.unit || '%';
        }

        if (this.id) {
            const common = this.props.objects[this.id] && this.props.objects[this.id].common;
            this.max = common.max;
            if (this.max === undefined) {
                this.max = 30;
            }
            this.max = parseFloat(this.max);

            this.min = common.min;
            if (this.min === undefined) {
                this.min = 12;
            }
            this.min = parseFloat(this.min);

            this.unit = common.unit || '°C';

            if (this.unit === 'C') {
                this.unit = '°C';
            } else
                if (this.unit === 'C°') {
                    this.unit = '°C';
                }
            if (this.unit === 'F') {
                this.unit = '°F';
            } else
                if (this.unit === 'F°') {
                    this.unit = '°F';
                }

            this.step = common.step || 0.5;

            this.props.tile.setState({ isPointer: true });
        }

        this.unit = this.unit || '°C';

        this.stateRx.showDialog = false;
        this.stateRx.showDialogBottom = false;
        this.props.tile.setState({ state: true });
        this.key = `smart-thermostat-${this.id}-`;
        this.step = this.step || 0.5;

        this.componentReady();
    }

    updateState(id, state) {
        let newState = {};
        if (!state) {
            return;
        }
        if (this.actualId === id || id === this.id || id === this.humidityId) {
            newState[id] = typeof state.val === 'number' ? state.val : parseFloat(state.val);
            if (isNaN(newState[id])) {
                newState[id] = null;
            }
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    setValue = degrees => {
        console.log('Control ' + this.id + ' = ' + degrees);
        const newValue = {};
        newValue[this.id] = degrees;
        this.setState(newValue);
        this.props.onControl(this.id, degrees);
    }

    getIcon() {
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter alt="icon" src={this.getDefaultIcon()} style={{ height: '100%', zIndex: 1 }} />);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter alt="icon" src={this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />);
            } else {
                customIcon = (<Icon className={clsGeneric.iconStyle} />);
            }
        }
        return SmartGeneric.renderIcon(customIcon, null, this.state[this.boostId]);
    }

    formatValue(num, unit) {
        if (num === null) {
            return '?';
        } else {
            const val = Math.round(num * 100) / 100;
            if (this.commaAsDelimiter) {
                return val.toString().replace('.', ',') + (unit || this.unit);
            } else {
                return val + (unit || this.unit);
            }
        }
    }

    // getStateText() {
    //     return this.formatValue(this.state[this.id]);
    // }


    getSecondaryDivTop() {
        return <div className={cls.temperature}>{this.formatValue(this.state[this.id])}</div>
    }

    getSecondaryDiv() {
        if (this.actualId === this.id && !this.humidityId) {
            return null;
        }
        return (
            <div key={this.key + 'tile-secondary'}
                className={cls.wrapperTextSecond}
                title={I18n.t('Environment values')}>
                {this.actualId !== this.id ?
                    [
                        (<IconThermometer key={this.key + 'tile-secondary-icon-0'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-0'} style={Theme.tile.secondary.text}>{this.formatValue(this.state[this.actualId])}</span>),
                        (<br key={this.key + 'tile-secondary-br-0'} />)
                    ] : null}
                {this.humidityId ?
                    [
                        (<IconHydro key={this.key + 'tile-secondary-icon-1'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-1'} style={Theme.tile.secondary.text}>{this.formatValue(this.state[this.humidityId], this.humUnit)}</span>)
                    ] : null}
            </div>);
    }

    onBoostToggle = boostOn => {
        if (boostOn === undefined) {
            boostOn = !this.state[this.boostId];
        }
        const newValue = {};
        newValue[this.boostId] = boostOn;
        this.setState(newValue);
        this.props.onControl(this.boostId, boostOn);
    }

    onToggleValue = powerOn => {
        debugger
        if (powerOn === undefined) {
            powerOn = !this.state[this.powerId];
        }
        const newValue = {};
        newValue[this.powerId] = powerOn;
        this.setState(newValue);
        this.props.onControl(this.powerId, powerOn);
    }
    
    render() {
        return this.wrapContent([
            this.getStandardContent(this.id, true),
            this.getSecondaryDiv(),
            this.getSecondaryDivTop(),
            this.getCharts(),
            this.state.showDialogBottom ?
                dialogChartCallBack(this.onDialogCloseBottom, this.settingsId, this.props.socket, this.props.themeType) : null,
            this.state.showDialog ?
                <Dialog
                    key={this.key + 'dialog'}
                    unit={this.unit}
                    transparent
                    commaAsDelimiter={this.commaAsDelimiter}
                    step={this.step}
                    dialogKey={this.key + 'dialog'}
                    startValue={this.state[this.id] === null || this.state[this.id] === undefined ? this.min : this.state[this.id]}
                    windowWidth={this.props.windowWidth}
                    actualValue={this.state[this.actualId] === null || this.state[this.actualId] === undefined ? this.min : this.state[this.actualId]}
                    boostValue={this.boostId ? this.state[this.boostId] : null}
                    onBoostToggle={this.onBoostToggle}
                    onPowerToggle={this.onToggleValue}
                    min={this.min}
                    max={this.max}
                    onValueChange={this.setValue}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default SmartThermostat;

