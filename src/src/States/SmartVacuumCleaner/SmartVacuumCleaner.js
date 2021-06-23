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
import iconRobot from '../../icons/robot-vacuum.svg';
import Icon from '../../icons/RobotVacuum';
import IconThermometer from '../../icons/ThermometerSimple';
import IconHydro from '../../icons/Humidity';
import Theme from '../../theme';
import Dialog from '../../Dialogs/SmartDialogVacuumCleaner';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';
import clsx from 'clsx';

class SmartVacuumCleaner extends SmartGeneric {
    // props = {
    //    objects: OBJECT
    //    tile: parentDiv
    //    states: STATES
    //    onControl: function
    // };

    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'POWER');
            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
                this.powerId = state.id;
            } else {
                this.id = '';
            }

            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');

            state = this.channelInfo.states.find(state => state.id && state.name === 'MODE');
            this.modeId = state?.id || `${parts}.MODE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WORK_MODE');
            this.workModeId = state?.id || `${parts}.WORK_MODE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WATER');
            this.watherId = state?.id || `${parts}.WATER`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WASTE');
            this.wasteId = state?.id || `${parts}.WASTE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'BATTERY');
            this.batteryId = state?.id || `${parts}.BATTERY`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STATE');
            this.stateId = state?.id || `${parts}.STATE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PAUSE');
            this.pauseId = state?.id || `${parts}.PAUSE`;

        }

        if (this.watherId) {
            const common = this.props.objects[this.watherId] && this.props.objects[this.watherId].common;
            debugger
            this.watherUnit = common.unit || '%';
        }

        if (this.wasteId) {
            const common = this.props.objects[this.wasteId] && this.props.objects[this.wasteId].common;
            this.wasteUnit = common.unit || '%';
        }

        if (this.batteryId) {
            const common = this.props.objects[this.batteryId] && this.props.objects[this.batteryId].common;
            this.batteryUnit = common.unit || '%';
        }

        // if (this.id) {
        //     const common = this.props.objects[this.id] && this.props.objects[this.id].common;
        //     this.max = common.max;
        //     if (this.max === undefined) {
        //         this.max = 30;
        //     }
        //     this.max = parseFloat(this.max);

        //     this.min = common.min;
        //     if (this.min === undefined) {
        //         this.min = 12;
        //     }
        //     this.min = parseFloat(this.min);

        //     this.unit = common.unit || '°C';

        //     if (this.unit === 'C') {
        //         this.unit = '°C';
        //     } else
        //         if (this.unit === 'C°') {
        //             this.unit = '°C';
        //         }
        //     if (this.unit === 'F') {
        //         this.unit = '°F';
        //     } else
        //         if (this.unit === 'F°') {
        //             this.unit = '°F';
        //         }

        //     this.step = common.step || 0.5;

        //     this.props.tile.setState({ isPointer: true });
        // }

        // this.unit = this.unit || '°C';

        this.stateRx.showDialog = false;
        this.stateRx.showDialogBottom = false;
        this.props.tile.setState({ state: true });
        this.key = `smart-vacuumCleaner-${this.id}-`;
        this.step = this.step || 0.5;

        this.componentReady();
    }

    // updateState(id, state) {
    //     let newState = {};
    //     if (!state) {
    //         return;
    //     }
    //     if (this.actualId === id || id === this.id || id === this.humidityId || id === this.modeId) {
    //         newState[id] = typeof state.val === 'number' ? state.val : parseFloat(state.val);
    //         if (isNaN(newState[id])) {
    //             newState[id] = null;
    //         }
    //         this.setState(newState);
    //     } else {
    //         super.updateState(id, state);
    //     }
    // }

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
            customIcon = (<IconAdapter className={clsx(clsGeneric.iconStyle, this.state[this.powerId] && clsGeneric.activeIconStyle)} alt="icon" src={this.getDefaultIcon()} style={{ height: '100%', zIndex: 1 }} />);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter className={clsx(clsGeneric.iconStyle, this.state[this.powerId] && clsGeneric.activeIconStyle)} alt="icon" src={this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />);
            } else {
                customIcon = (<Icon className={clsx(clsGeneric.iconStyle, this.state[this.powerId] && clsGeneric.activeIconStyle)} />);
            }
        }
        return SmartGeneric.renderIcon(customIcon, this.state.executing, this.state[this.powerId], this.onPowerToggle.bind(this));
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
        if (!this.humidityId) {
            return null;
        }
        return (
            <div key={this.key + 'tile-secondary'}
                className={cls.wrapperTextSecond}
                title={I18n.t('Environment values')}>
                {this.humidityId ?
                    [
                        (<IconHydro key={this.key + 'tile-secondary-icon-1'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-1'} style={Theme.tile.secondary.text}>{this.formatValue(this.state[this.humidityId], this.humUnit)}</span>)
                    ] : null}
            </div>);
    }

    getSecondaryDivActual() {
        if (this.actualId === this.id) {
            return null;
        }
        return (
            <div key={this.key + 'tile-secondary'}
                className={cls.wrapperTextSecondActual}
                title={I18n.t('Environment values')}>
                {this.actualId !== this.id ?
                    [
                        (<IconThermometer key={this.key + 'tile-secondary-icon-0'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
                        (<span key={this.key + 'tile-secondary-text-0'} style={Theme.tile.secondary.text}>{this.formatValue(this.state[this.actualId])}</span>),
                        (<br key={this.key + 'tile-secondary-br-0'} />)
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

    onPowerToggle = () => {
        this.setState({ executing: true });
        this.props.onControl(this.powerId, !this.state[this.powerId], null, () => this.setState({ executing: false }));
    }

    onPartyToggle = () => {
        this.setState({ executing: true });
        this.props.onControl(this.partyId, !this.state[this.partyId], null, () => this.setState({ executing: false }));
    }

    onMode = (value) => {
        this.props.onControl(this.modeId, Number(value));
    }

    onSwing = (value) => {
        let newValue;
        if (typeof this.state[this.swingId] === 'number') {
            newValue = Number(value);
        } else {
            newValue = !this.state[this.swingId];
        }
        this.props.onControl(this.swingId, newValue);
    }

    updateState(id, state) {
        let newState = {};
        if (!state) {
            return;
        }
        if (this.powerId === id || this.id === id || id === this.humidityId || id === this.modeId) {
            debugger
            newState[id] = typeof state.val !== 'number' ? state.val : parseFloat(state.val);
            if (isNaN(newState[id])) {
                newState[id] = null;
            }
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    render() {
        console.log(11223344,this.state)
        return this.wrapContent([
            this.getStandardContent(this.id, false),
            this.getSecondaryDiv(),
            this.getSecondaryDivActual(),
            this.getSecondaryDivTop(),
            this.getCharts(this.actualId),
            this.state.showDialogBottom ?
                dialogChartCallBack(this.onDialogCloseBottom, this.actualId, this.props.socket, this.props.themeType, this.props.systemConfig, this.props.allObjects, this.getIdHistorys(this.getAllIds())) : null,
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
                    //checkHistory
                    checkHistory={this.checkHistory}
                    //swing
                    swingValue={this.swingId ? this.state[this.swingId] : null}
                    swingArray={this.swingId ? this.props.objects[this.swingId]?.common?.states : null}
                    onSwing={this.onSwing.bind(this)}
                    //boost
                    boostValue={this.boostId ? this.state[this.boostId] : null}
                    onBoostToggle={this.onBoostToggle}
                    //power
                    powerValue={this.powerId ? this.state[this.powerId] : null}
                    onPowerToggle={this.onPowerToggle.bind(this)}
                    //party
                    partyValue={this.partyId ? this.state[this.partyId] : null}
                    onPartyToggle={this.onPartyToggle.bind(this)}
                    //mode
                    modeValue={this.modeId ? this.state[this.modeId] : null}
                    modeArray={this.modeId ? this.props.objects[this.modeId]?.common?.states : null}
                    onMode={this.onMode.bind(this)}
                    //........
                    min={this.min}
                    max={this.max}
                    themeName={this.props.themeName}
                    socket={this.props.socket}
                    onValueChange={this.setValue}
                    onClose={this.onDialogClose}
                    ///Charts ids
                    humidityId={this.props.objects[this.humidityId] ? this.humidityId : null}
                    actualId={this.props.objects[this.actualId] && this.actualId.indexOf('ACTUAL') !== -1 ? this.actualId : null}
                    setId={this.props.objects[this.id] ? this.id : null}
                    ///Modal Charts
                    openModal={id => dialogChartCallBack(() => { }, id, this.props.socket, this.props.themeType, this.props.systemConfig, this.props.allObjects, [])}
                /> : null
        ]);
    }
}

export default SmartVacuumCleaner;

