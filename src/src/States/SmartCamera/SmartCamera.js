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
import Dialog from '../../Dialogs/SmartDialogCamera';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';

class SmartCamera extends SmartGeneric {
    constructor(props) {
        super(props);

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // GPS
            let state = this.channelInfo.states.find(state => state.id && state.name === 'FILE');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }
            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');

            state = this.channelInfo.states.find(state => state.id && state.name === 'AUTOFOCUS');
            this.autoFocusId = state?.id || `${parts}.AUTOFOCUS`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'AUTOWHITEBALANCE');
            this.autoWhiteBalanceId = state?.id || `${parts}.AUTOWHITEBALANCE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'BRIGHTNESS');
            this.brightnessId = state?.id || `${parts}.BRIGHTNESS`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'NIGHTMODE');
            this.nightModeId = state?.id || `${parts}.NIGHTMODE`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PTZ');
            this.ptzId = state?.id || `${parts}.PTZ`;

            this.zoomMin = 0;
            this.zoomMax = 100;
            if (this.props.objects[this.ptzId]?.common?.min !== undefined) {
                this.zoomMin = parseFloat(this.props.objects[this.ptzId].common.min);
            }
            if (this.props.objects[this.ptzId]?.common?.max !== undefined) {
                this.zoomMax = parseFloat(this.props.objects[this.ptzId].common.max);
            }
        }

        

        this.width = 2;
        this.props.tile.setState({ isPointer: false });
        this.props.tile.setState({ state: true });
        this.key = `smart-camera-${this.id}-`;
        this.stateRx.showChartBottom = true;
        this.stateRx.chartSettingsId = this.id;
        // this.stateRx.showDialogBottom = false;
        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.componentReady();
    }

    componentDidMount() {
        // get type of object 
        if (this.props.objects[this.id].common.type === 'file') {
            // read every 5000
            this.updateInterval = setInterval(() => 
                this.props.socket.getBinaryState(this.id)
                    .then(base64 => {
                        // Use dom to update image
                    }), 5000);
        }    
    }

    componentWillUnmount() {
        this.updateInterval && clearInterval(this.updateInterval);
    }

    applySettings(settings) {
        settings = settings || (this.state && this.state.settings);
        if (settings) {
            if (settings.tempID && (!this.subscribes || !this.subscribes.includes(settings.tempID))) {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.tempID);
            }
            if (settings.humidityID && (!this.subscribes || !this.subscribes.includes(settings.humidityID))) {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.humidityID);
            }
        }
    }

    updateState(id, state) {
        let newState = {};
        if (!state) {
            return;
        }
        if (id === this.id ||
            id === this.autoFocusId ||
            id === this.autoWhiteBalanceId ||
            id === this.brightnessId ||
            id === this.nightModeId ||
            id === this.ptzId) {
            newState[id] = typeof state.val !== 'number' ? state.val : parseFloat(state.val);
            if (typeof state.val === 'number' && isNaN(newState[id])) {
                newState[id] = null;
            }
            if (id === this.id) {
                if (state.lc) {
                    this.lastChange = state.lc;
                } else {
                    this.lastChange = 0;
                }
            }
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        let settings = super.getDialogSettings();
        // remove doubleSize from list
        settings = settings.filter((e, i) => {
            if (e && (e.name === 'noAck'
                || e.name === 'colorOn'
                || e.name === 'icon'
                || e.name === 'background'
            )) {
                return false;
            }
            return true;
        });
        return settings;
    }

    getDataCamera() {
        return <>
            <div className={cls.name}>{this.state.settings.name}</div>
            <div className={cls.wrapCamera}>
                <IconAdapter className={cls.camera} src={this.state[this.id]} />
            </div>
        </>;
    }

    onToggle = (id = this.id) => {
        this.setState({ executing: true });
        this.props.onControl(id, !this.state[id], null, () => this.setState({ executing: false }));
    }

    onPtzChange = (value) => {
        this.setState({ executing: true });
        this.props.onControl(this.ptzId, value, null, () => this.setState({ executing: false }));
    }

    render() {
        return this.wrapContent([
            this.getDataCamera(),
            this.state.showDialog ?
                <Dialog
                    dialogKey={this.key + 'dialog'}
                    open={true}
                    key={this.key + 'dialog'}
                    transparent
                    overflowHidden

                    file={this.id ? this.state[this.id] : null}

                    autoFocus={this.autoFocusId ? this.state[this.autoFocusId] : null}
                    onAutoFocusToggle={() => this.onToggle(this.autoFocusId)}

                    autoWhiteBalance={this.autoWhiteBalanceId ? this.state[this.autoWhiteBalanceId] : null}
                    onAutoWhiteBalanceToggle={() => this.onToggle(this.autoWhiteBalanceId)}

                    brightness={this.brightnessId ? this.state[this.brightnessId] : null}
                    onBrightnessToggle={() => this.onToggle(this.brightnessId)}

                    nightMode={this.nightModeId ? this.state[this.nightModeId] : null}
                    onNightModeToggle={() => this.onToggle(this.nightModeId)}

                    ptz={this.ptzId ? this.state[this.ptzId] : null}
                    zoomMin={this.zoomMin || 0}
                    zoomMax={this.zoomMax || 100}
                    onPtzChange={this.onPtzChange}

                    name={this.state.settings.name}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default SmartCamera;
