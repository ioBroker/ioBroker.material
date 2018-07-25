/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
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
import SmartGeneric from './SmartGeneric';
import Icon from '../icons/Thermometer'
import IconThermometer from '../icons/ThermometerSimple';
import IconHydro from '../icons/Humidity';
import Theme from '../theme';
import Dialog from './SmartDialogThermostat';
import I18n from "../i18n";

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
            if (state && this.props.objects[state.id]&& this.props.objects[state.id].common) {
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

            this.props.tile.setState({
                isPointer: true
            });
        }

        this.unit = this.unit || '°C';

        this.stateRx.showDialog = false;
        this.props.tile.setState({state: true});
        this.key = 'smart-thermostat-' + this.id + '-';

        this.componentReady();
    }

    updateState(id, state) {
        let newState = {};
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

    setValue(degrees) {
        console.log('Control ' + this.id + ' = ' + degrees);
        const newValue = {};
        newValue[this.id] = degrees;
        this.setState(newValue);
        this.props.onControl(this.id, degrees);
    }

    getIcon() {
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<img src={this.getDefaultIcon()} style={{height: '100%', zIndex: 1}}/>);
        } else {
            customIcon = (<Icon width={'100%'} height={'100%'} style={{zIndex: 1}}/>);
        }
        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, {}, {left: '0.5em'})} className="tile-icon">
                {customIcon}
            </div>
        );
    }

    getStateText() {
        if (this.state[this.id] === null) {
            return '?';
        } else {
            return this.state[this.id] + this.unit;
        }
    }

    getSecondaryDiv() {
        if (this.actualId === this.id && !this.humidityId) {
            return null;
        }
        return (
            <div key={this.key + 'tile-secondary'} className="tile-text-second"
                 style={Object.assign({}, Theme.tile.secondary.div, {top: '1em'})} title={I18n.t('Environment values')}>
                {this.actualId !== this.id ?
                    [
                        (<IconThermometer key={this.key + 'tile-secondary-icon-0'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-0'} style={Theme.tile.secondary.text}>{this.state[this.actualId] === null ? '?' : this.state[this.actualId] + this.unit}</span>),
                        (<br key={this.key + 'tile-secondary-br-0'} />)
                    ] : null}
                {this.humidityId ?
                    [
                        (<IconHydro key={this.key + 'tile-secondary-icon-1'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-1'} style={Theme.tile.secondary.text}>{this.state[this.humidityId] === null ? '?' : this.state[this.humidityId] + this.humUnit}</span>)
                    ] : null}
            </div>);
    }

    onBoostToggle(boostOn) {
        if (boostOn === undefined) {
            boostOn = !this.state[this.boostId];
        }
        const newValue = {};
        newValue[this.boostId] = boostOn;
        this.setState(newValue);
        this.props.onControl(this.boostId, boostOn);
    }

    render() {
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon" style={{pointerEvents: 'none'}}>{this.getIcon()}</div>),
            this.getSecondaryDiv(),
            (<div key={this.key + 'tile-text'} className="tile-text" style={Object.assign({}, Theme.tile.tileText, this.state.nameStyle, {marginTop: '3.1em'})}>
                <div className="tile-channel-name" style={Theme.tile.tileName}>{this.state.settings.name}</div>
                <div className="tile-state-text"
                     style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                        dialogKey={this.key + 'dialog'}
                        startValue={this.state[this.id]}
                        windowWidth={this.props.windowWidth}
                        actualValue={this.state[this.actualId]}
                        boostValue={this.boostId ? this.state[this.boostId] : null}
                        onBoostToggle={this.onBoostToggle.bind(this)}
                        min={this.min}
                        max={this.max}
                        onValueChange={this.setValue.bind(this)}
                        onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default SmartThermostat;

