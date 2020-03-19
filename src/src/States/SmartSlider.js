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
import CircularProgress from '@material-ui/core/CircularProgress';
import SmartGeneric from './SmartGeneric';
import {TiLightbulb as Icon} from 'react-icons/ti';
import Theme from '../theme';
import Dialog from '../Dialogs/SmartDialogSlider';

class SmartSlider extends SmartGeneric {
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
        }

        if (this.id) {
            this.max = this.props.objects[this.actualId].common.max;
            this.min = this.props.objects[this.actualId].common.min;

            this.props.tile.setState({
                isPointer: true
            });

            this.unit = this.props.objects[this.actualId].common.unit;
            this.unit = this.unit ? ' ' + this.unit : '';
        }

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;
        this.key = 'smart-slider-' + this.id + '-';
        this.doubleState = true; // used in generic

        this.icon = Icon;

        this.componentReady();
    }

    updateState(id, state) {
        let newState = {};
        const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
        if (!state) {
            return;
        }
        if (this.actualId === id || (this.id === id && this.id === this.actualId && state.ack)) {
            if (!isNaN(val)) {
                newState[id] = val;
                this.setState(newState);

                const tileState = val !== this.min;
                this.props.tile.setState({state: tileState});
            } else {
                newState[id] = null;
                this.setState(newState);
                this.props.tile.setState({state: false});
            }

            // hide desired value
            if (this.state.setValue === newState[id] && state.ack) {
                this.setState({setValue: null});
            }

            if (state.ack && this.state.executing) {
                this.setState({executing: false});
            }
        } else if (id === this.id) {
            newState[id] = val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    setValue(value) {
        console.log('Control ' + this.id + ' = ' + value);
        if (this.actualId !== this.id) {
            this.setState({executing: true, setValue: value});
        }
        this.props.onControl(this.id, value);
    }

    getIcon() {
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<img src={this.getDefaultIcon()} alt="icon" style={{height: '100%'}}/>);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<img src={this.state.settings.icon} alt="icon" style={{height: '100%'}}/>);
            } else {
                let IconCustom = this.icon;
                if (IconCustom) {
                    customIcon = (<IconCustom width={Theme.tile.tileIconSvg.size} height={Theme.tile.tileIconSvg.size} style={{height: Theme.tile.tileIconSvg.size, width: Theme.tile.tileIconSvg.size}}/>);
                }
            }
        }
        if (customIcon) {
            return (
                <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                    {customIcon}
                    {this.state.executing ? <CircularProgress style={{position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    getDialogSettings () {
        const settings = super.getDialogSettings();
        settings.push({
            name: 'decimals',
            value: this.state.settings.decimals || 0,
            type: 'number',
            min: 0,
            max: 6
        });

        return settings;
    }

    getStateText() {
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            if (this.workingId && this.state[this.workingId] && this.state.setValue !== null && this.state.setValue !== undefined) {
                return this.roundValue(this.state[this.id]) + this.unit + ' → ' + this.state.setValue + this.unit;
            } else {
                return this.roundValue(this.state[this.id]) + this.unit;
            }
        }
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(null, true),
            this.state.showDialog ?
                <Dialog dialogKey={this.key + 'dialog'}
                        key={this.key + 'dialog'}
                        startValue={this.state[this.id]}
                        windowWidth={this.props.windowWidth}
                        min={this.min}
                        max={this.max}
                        unit={this.unit}
                        onValueChange={this.setValue.bind(this)}
                        onClose={this.onDialogClose.bind(this)}
                        type={Dialog.types.value}
                /> : null
        ]);
    }
}

export default SmartSlider;

