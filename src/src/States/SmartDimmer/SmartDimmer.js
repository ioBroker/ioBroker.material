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
import CircularProgress from '@material-ui/core/CircularProgress';

import { TiLightbulb as Icon } from 'react-icons/ti'

import SmartGeneric from '../SmartGeneric';
import Theme from '../../theme';
import Dialog from '../../Dialogs/SmartDialogSlider';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx';

class SmartDimmer extends SmartGeneric {
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

            state = this.channelInfo.states.find(state => state.id && state.name === 'ON_SET');
            this.onId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ON_ACTUAL');
            this.onActualId = state ? state.id : this.onId;
        }

        if (this.id) {
            this.max = this.props.objects[this.actualId].common.max;
            if (this.max === undefined) {
                this.max = 100;
            }
            this.max = parseFloat(this.max);

            this.min = this.props.objects[this.actualId].common.min;
            if (this.min === undefined) {
                this.min = 0;
            }
            this.min = parseFloat(this.min);

            this.props.tile.setState({
                isPointer: true
            });
        }

        this.key = 'smart-dimmer-' + this.id + '-';

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;
        this.noAck = true;  // used in generic
        this.doubleState = true; // used in generic

        this.componentReady();
    }

    realValueToPercent(val) {
        if (val === undefined) {
            if (this.props.states[this.actualId]) {
                val = this.props.states[this.actualId].val || 0;
            } else {
                val = 0;
            }
        }
        val = parseFloat(val);
        return Math.round((val - this.min) / (this.max - this.min) * 100);
    }

    percentToRealValue(percent) {
        percent = parseFloat(percent);
        return Math.round((this.max - this.min) * percent / 100);
    }

    updateState(id, state) {
        let newState = {};

        if (!state) {
            return;
        }

        if (this.onActualId === id || (this.onId === id && this.onId === this.onActualId && state.ack)) {
            let val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON' || state.val === 'ein' || state.val === 'EIN';
            newState[id] = val;

            this.setState(newState);

            this.props.tile.setState({
                state: val
            });
            if (state.ack && this.state.executing) {
                this.setState({ executing: false });
            }
        } else
            if (this.actualId === id || (this.id === id && this.id === this.actualId && state.ack)) {
                const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
                if (!isNaN(val)) {
                    newState[id] = this.realValueToPercent(val);
                    this.setState(newState);

                    if (!this.onActualId) {
                        const tileState = val !== this.min;
                        this.props.tile.setState({
                            state: tileState
                        });
                    }
                } else {
                    newState[id] = null;
                    this.setState(newState);
                    if (!this.onActualId) {
                        this.props.tile.setState({
                            state: false
                        });
                    }
                }

                // hide desired value
                if (this.state.setValue === newState[id] && state.ack) {
                    this.setState({ setValue: null });
                }

                if (state.ack && this.state.executing) {
                    this.setState({ executing: false });
                }
            } else if (id === this.id) {
                newState[id] = typeof state.val === 'number' ? state.val : parseFloat(state.val);
                this.setState(newState);
            } else if (id === this.onId) {
                newState[id] = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON' || state.val === 'ein' || state.val === 'EIN';
                this.setState(newState);
            } else {
                super.updateState(id, state);
            }
    }

    setValue = percent => {
        if (percent) {
            this.lastNotNullPercent = percent;
        } else {
            const p = this.realValueToPercent();
            if (p) {
                this.lastNotNullPercent = p;
            }
        }

        console.log('Control ' + this.id + ' = ' + this.percentToRealValue(percent));
        this.setState({ executing: this.state.settings.noAck ? false : true, setValue: percent });
        this.props.onControl(this.id, this.percentToRealValue(percent));
    }

    onToggleValue = () => {
        if (this.onId) {
            this.props.onControl(this.onId, !this.state[this.onActualId]);
        } else {
            let newValue;
            const percent = this.realValueToPercent();
            if (percent) {
                newValue = 0;
            } else {
                newValue = this.lastNotNullPercent || 100;
            }
            this.setValue(newValue);
        }
    }

    getIcon() {
        let customIcon;
        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter src={this.getDefaultIcon()} alt="icon" style={{ height: '100%' }} />);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter src={this.state.settings.icon} alt="icon" style={{ height: '100%' }} />);
            } else {
                customIcon = (<Icon className={clsx(clsGeneric.iconStyle, this.state[this.actualId] !== this.min && clsGeneric.activeIconStyle)} />);
            }
        }
        // return (
        //     <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
        //         {customIcon}
        //         {this.state.executing ? <CircularProgress style={{position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
        //     </div>
        // );
        return SmartGeneric.renderIcon(customIcon, this.state.executing, this.state[this.actualId] !== this.min);
    }

    getStateText() {
        if (this.onActualId && this.state[this.onActualId] === false) {
            return I18n.t('Off');
        }
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            if (this.workingId && this.state[this.workingId] && this.state.setValue !== null && this.state.setValue !== undefined) {
                return this.realValueToPercent(this.state[this.actualId]) + '% → ' + this.state.setValue + '%';
            } else {
                return this.realValueToPercent(this.state[this.actualId]) + '%';
            }
        }
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.id, true),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                    open={true}
                    transparent
                    windowWidth={this.props.windowWidth}
                    startValue={this.realValueToPercent()}
                    onValueChange={this.setValue}
                    startToggleValue={this.onActualId ? this.state[this.onActualId] : false}
                    onToggle={this.onId && this.onToggleValue}
                    onClose={this.onDialogClose}
                    type={Dialog.types.dimmer}
                /> : null
        ]);
    }
}

export default SmartDimmer;

