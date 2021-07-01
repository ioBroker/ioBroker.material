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
import Dialog from '../../Dialogs/SmartDialogEchartCustom';
import EchartIframe from '../../basic-controls/react-echart/EchartIframe';
import Utils from '@iobroker/adapter-react/Components/Utils';

class SmartEchart extends SmartGeneric {
    constructor(props) {
        super(props);

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // debugger
            // GPS
            let state = this.channelInfo.states.find(state => state && state.id && state.name === 'URL');
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
            if (settings.tempID && (!this.subscribes || this.subscribes.indexOf(settings.tempID) === -1)) {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.tempID);
            }
            if (settings.humidityID && (!this.subscribes || this.subscribes.indexOf(settings.humidityID) === -1)) {
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
        if (this.accuracy === id || id === this.id || id === this.radius || id === this.elevation) {
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
        // settings.push({
        //     name: 'chartLast',
        //     value: this.state.settings.chartLast || false,
        //     type: 'boolean'
        // });
        // settings.push({
        //     name: 'tempID',
        //     value: this.state.settings.tempID || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'humidityID',
        //     value: this.state.settings.humidityID || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'locationText',
        //     value: this.state.settings.locationText || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'hideFirstDay',
        //     value: this.state.settings.hideFirstDay || false,
        //     type: 'boolean'
        // });
        settings.push({
            name: 'zoomMiniMap',
            value: this.state.settings.zoomMiniMap || 12,
            max: 18,
            type: 'number'
        });
        settings.push({
            name: 'zoomDialogMap',
            value: this.state.settings.zoomDialogMap || 15,
            max: 18,
            type: 'number'
        });
        // remove doubleSize from list
        settings = settings.filter((e, i) => {
            if (e && (e.name === 'noAck'
                || e.name === 'colorOn'
                // || e.name === 'icon'
                || e.name === 'background'
            )) {
                return false;
            }
            return true;
        });
        settings.unshift({
            type: 'delete'
        });
        return settings;
    }
    getLocation() {
        return <EchartIframe
            name={this.state.settings.name}
        />;
    }

    render() {
        return this.wrapContent([
            this.getLocation(),
            this.state.showDialog ?
                <Dialog
                    dialogKey={this.key + 'dialog'}
                    key={this.key + 'dialog'}
                    transparent
                    name={this.state.settings.name}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    objects={this.props.objects}
                    ids={this.ids}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                    iconSetting={this.state.settings.icon || null}
                    center={this.state[this.id]}
                    data={this.getStandardContent(this.id, false, true)}
                    radius={this.state[this.radius]}
                    getReadHistoryData={callback => this.getReadHistoryData(this.id, callback)}
                /> : null
        ]);
    }
}

export default SmartEchart;
