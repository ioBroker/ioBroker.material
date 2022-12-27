/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
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
import Dialog from '../../Dialogs/SmartDialogEchartCustom';
import EchartIframe from '../../basic-controls/react-echart/EchartIframe';
import { Utils } from '@iobroker/adapter-react-v5';

class SmartEchart extends SmartGeneric {
    constructor(props) {
        super(props);

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // debugger
            // GPS
            let state = this.channelInfo.states.find(state => state && state.id && (state.name === 'CHART' || state.name === 'URL'));
            if (state) {
                this.id = state.id;
                const settingsId = state.settingsId;
                if (settingsId) {
                    const settings = Utils.getSettingsCustomURLs(this.props.objects[settingsId], null, { user: this.props.user });
                    if (settings) {
                        const tile = settings.find(e => e.id === state.id);
                        if (tile) {
                            this.stateRx.settings = JSON.parse(JSON.stringify(tile));
                            this.customSettings = this.stateRx.settings;
                        }
                    }
                }
            } else {
                this.id = '';
            }
        }

        this.width = 2;
        this.props.tile.setState({ isPointer: false });
        this.props.tile.setState({ state: true });
        this.key = `smart-echart-${this.id}-`;

        // this.stateRx.showDialogBottom = false;
        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.componentReady();
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
        if (id === this.id) {
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

    getEchartIds() {
        return Object.keys(this.props.objects)
            .filter(key => key.startsWith('echarts.0') && key !== 'echarts.0');
    }

    getDialogSettings() {
        let settings = super.getDialogSettings();
        // remove doubleSize from list
        settings = settings.filter((e, i) => {
            return !(e && (e.name === 'noAck'
                || e.name === 'colorOn'
                || e.name === 'icon'
                || e.name === 'background'
            ));
        });

        if (!this.id.startsWith('echarts.')) {
            settings.unshift({
                name: 'echartId',
                value: this.state?.settings?.echartId || 'none',
                options: [...this.getEchartIds(), 'none'],
                type: 'select'
            });
            settings.unshift({
                type: 'delete'
            });
        }

        return settings;
    }

    getLocation() {
        return <EchartIframe
            key={this.key + 'iframe'}
            name={this.state.settings.name}
            id={!this.id.startsWith('echarts.') ? this.state?.settings?.echartId : this.id}
        />;
    }

    render() {
        this.checkCornerTop(!this.id.startsWith('echarts.')?this.state?.settings?.echartId && this.state?.settings?.echartId !== 'none':this.id,true);

        return this.wrapContent([
            this.getLocation(),
            this.state.showDialog ?
                <Dialog
                    dialogKey={this.key + 'dialog'}
                    key={this.key + 'dialog'}
                    transparent
                    name={this.state.settings.name}
                    settings={this.state.settings}
                    id={!this.id.startsWith('echarts.')?this.state?.settings?.echartId:this.id}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default SmartEchart;
