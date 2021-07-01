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
import SmartGeneric from '../SmartGeneric';

import Icon from '../../icons/RobotVacuum';
import Theme from '../../theme';
import Dialog from '../../Dialogs/SmartDialogVacuumCleaner';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';
import { IoMdBatteryCharging } from "react-icons/io";
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
            let state = this.channelInfo.states.find(state => state.id && state.name === 'POWER');//
            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
                this.powerId = state.id;
            } else {
                this.id = '';
            }

            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');

            state = this.channelInfo.states.find(state => state.id && state.name === 'MODE');//
            this.modeId = state?.id || `${parts}.MODE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WORK_MODE');//
            this.workModeId = state?.id || `${parts}.WORK_MODE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WATER');
            this.waterId = state?.id || `${parts}.WATER`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WASTE');
            this.wasteId = state?.id || `${parts}.WASTE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'BATTERY');
            this.batteryId = state?.id || `${parts}.BATTERY`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STATE');
            this.stateId = state?.id || `${parts}.STATE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PAUSE');//
            this.pauseId = state?.id || `${parts}.PAUSE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'MAP_BASE64');//
            this.mapBase64Id = state?.id || `${parts}.MAP_BASE64`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'MAP_URL');//
            this.mapUrlId = state?.id || `${parts}.MAP_URL`;
            
            //Indicators
            state = this.channelInfo.states.find(state => state.id && state.name === 'FILTER');//
            this.filterId = state?.id || `${parts}.FILTER`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'SENSORS');//
            this.sensorId = state?.id || `${parts}.SENSORS`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'BRUSH');//
            this.brushId = state?.id || `${parts}.BRUSH`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'SIDE_BRUSH');//
            this.sideBrushId = state?.id || `${parts}.SIDE_BRUSH`;
            //
            this.imageId = `${parts}.IMAGE`;
        }

        if (this.waterId) {
            const common = this.props.objects[this.waterId] && this.props.objects[this.waterId].common;
            this.waterUnit = common?.unit || '%';
        }

        if (this.wasteId) {
            const common = this.props.objects[this.wasteId] && this.props.objects[this.wasteId].common;
            this.wasteUnit = common?.unit || '%';
        }

        if (this.batteryId) {
            const common = this.props.objects[this.batteryId] && this.props.objects[this.batteryId].common;
            this.batteryUnit = common?.unit || '%';
        }
        //Indicators
        if (this.filterId) {
            const common = this.props.objects[this.filterId] && this.props.objects[this.filterId].common;
            this.filterUnit = common?.unit || '%';
        }
        if (this.sensorId) {
            const common = this.props.objects[this.sensorId] && this.props.objects[this.sensorId].common;
            this.sensorUnit = common?.unit || '%';
        }
        if (this.brushId) {
            const common = this.props.objects[this.brushId] && this.props.objects[this.brushId].common;
            this.brushUnit = common?.unit || '%';
        }
        if (this.sideBrushId) {
            const common = this.props.objects[this.sideBrushId] && this.props.objects[this.sideBrushId].common;
            this.sideBrushUnit = common?.unit || '%';
        }

        this.stateRx.showDialog = false;
        this.stateRx.showDialogBottom = false;
        this.props.tile.setState({ state: true });
        this.key = `smart-vacuumCleaner-${this.id}-`;
        this.step = this.step || 0.5;
        this.stateRx.checkAllStates = true;

        this.componentReady();
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
        return <div className={cls.battery}><IoMdBatteryCharging />{this.formatValue(this.state[this.batteryId], this.batteryUnit)}</div>
    }

    // getSecondaryDiv() {
    //     if (!this.humidityId) {
    //         return null;
    //     }
    //     return (
    //         <div key={this.key + 'tile-secondary'}
    //             className={cls.wrapperTextSecond}
    //             title={I18n.t('Environment values')}>
    //             {this.humidityId ?
    //                 [
    //                     (<IconHydro key={this.key + 'tile-secondary-icon-1'} style={Object.assign({}, Theme.tile.secondary.icon)} />),
    //                     (<span key={this.key + 'tile-secondary-text-1'} style={Theme.tile.secondary.text}>{this.formatValue(this.state[this.humidityId], this.humUnit)}</span>)
    //                 ] : null}
    //         </div>);
    // }

    getSecondaryDivActual() {
        if (!this.stateId) {
            return null;
        }
        return <div key={this.key + 'tile-secondary'}
                className={cls.wrapperTextSecondActual}
                title={I18n.t('Environment values')}>
                {this.stateId ?
                    <span key={this.key + 'tile-secondary-text-0'} style={Theme.tile.secondary.text}>
                        {this.state[this.stateId]}
                    </span>
                    : null}
            </div>;
    }

    onPauseToggle = () => {
        this.props.onControl(this.pauseId, !this.state[this.pauseId]);
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

    onWorkMode = (value) => {
        this.props.onControl(this.workModeId, Number(value));
    }

    updateState(id, state) {
        let newState = {};
        if (!state) {
            return;
        }
        if (id === this.stateId) {
            const states = this.props.objects[id]?.common?.states;
            if (states) {
                if (states[state.val])  {
                    state.val = states[state.val];
                }
            }
        }

        if (this.mapBase64Id === id || 
            this.mapUrlId === id || 
            this.waterId === id || 
            this.wasteId === id || 
            //this.filterId === id || 
            this.imageId === id || 
            this.batteryId === id || 
            this.stateId === id || 
            this.pauseId === id || 
            this.workModeId === id || 
            this.powerId === id || 
            this.id === id || 
            this.filterId === id || 
            this.sensorId === id || 
            this.brushId === id || 
            this.sideBrushId === id || 
            this.humidityId === id || 
            this.modeId === id
        ) {
            newState[id] = typeof state.val !== 'number' ? state.val : parseFloat(state.val);
            if (typeof state.val === 'number' && isNaN(newState[id])) {
                newState[id] = null;
            }
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.id, false),
            // this.getSecondaryDiv(),
            this.getSecondaryDivActual(),
            this.getSecondaryDivTop(),
            this.getCharts(this.actualId, null, false),
            this.state.showDialogBottom ?
                dialogChartCallBack(this.onDialogCloseBottom, this.batteryId, this.props.socket, this.props.themeType, this.props.systemConfig, this.props.allObjects, this.getIdHistorys(this.getAllIds(true))) : null,
            this.state.showDialog ?
                <Dialog
                    key={this.key + 'dialog'}
                    unit={this.unit}
                    transparent
                    overflowHidden
                    commaAsDelimiter={this.commaAsDelimiter}
                    step={this.step}
                    dialogKey={this.key + 'dialog'}
                    startValue={this.state[this.id] === null || this.state[this.id] === undefined ? this.min : this.state[this.id]}
                    windowWidth={this.props.windowWidth}
                    actualValue={this.state[this.actualId] === null || this.state[this.actualId] === undefined ? this.min : this.state[this.actualId]}
                    //state
                    stateVacuum={this.stateId ? this.state[this.stateId] : null}
                    //FILTER
                    filterVacuum={this.filterId ? this.state[this.filterId] : null}
                    filterUnit={this.filterUnit}
                    //SENSORS
                    sensorVacuum={this.sensorId ? this.state[this.sensorId] : null}
                    sensorUnit={this.sensorUnit}
                    //SIDE_BRUSH
                    brushVacuum={this.brushId ? this.state[this.brushId] : null}
                    brushUnit={this.brushUnit}
                    //battery
                    sideBrushVacuum={this.sideBrushId ? this.state[this.sideBrushId] : null}
                    sideBrushUnit={this.sideBrushUnit}
                    //battery
                    batteryVacuum={this.batteryId ? this.state[this.batteryId] : null}
                    batteryUnit={this.batteryUnit}
                    //waste
                    wasteVacuum={this.wasteId ? this.state[this.wasteId] : null}
                    wasteUnit={this.wasteUnit}
                    //waterId
                    waterVacuum={this.waterId ? this.state[this.waterId] : null}
                    waterUnit={this.waterUnit}
                    //workMode
                    workModeValue={this.workModeId ? this.state[this.workModeId] : null}
                    workModeArray={this.workModeId ? this.props.objects[this.workModeId]?.common?.states : null}
                    onWorkMode={this.onWorkMode.bind(this)}
                    //image
                    imageVacuum={this.imageId && this.state[this.imageId] ? this.state[this.imageId] :
                        this.mapBase64Id && this.state[this.mapBase64Id] ? this.state[this.mapBase64Id] :
                            this.mapUrlId && this.state[this.mapUrlId] ? this.state[this.mapUrlId] : null}
                    //pause
                    pauseValue={this.pauseId ? this.state[this.pauseId] : null}
                    onPauseToggle={this.onPauseToggle.bind(this)}
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
                // openModal={id => dialogChartCallBack(() => { }, id, this.props.socket, this.props.themeType, this.props.systemConfig, this.props.allObjects, [])}
                /> : null
        ]);
    }
}

export default SmartVacuumCleaner;

