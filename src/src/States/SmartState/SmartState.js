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
import Moment from 'react-moment';

import { I18n, Utils, Icon as IconAdapter } from '@iobroker/adapter-react-v5';

import SmartGeneric from '../SmartGeneric';
import IconWindowOpened from '../../icons/WindowOpened';
import IconWindowClosed from '../../icons/WindowClosed';
import IconMotionOn from '../../icons/MotionOn';
import IconMotionOff from '../../icons/MotionOff';
import IconFireOn from '../../icons/FireOn';
import IconFireOff from '../../icons/FireOff';
import IconFloodOn from '../../icons/FloodOn';
import IconFloodOff from '../../icons/FloodOff';
import IconDoorOpened from '../../icons/DoorOpened';
import IconDoorClosed from '../../icons/DoorClosed';
import { MdBrightness1 as IconSun1 } from 'react-icons/md';
import { MdBrightness2 as IconSun2 } from 'react-icons/md';
import { MdBrightness3 as IconSun3 } from 'react-icons/md';
import { MdBrightness4 as IconSun4 } from 'react-icons/md';
import { MdBrightness5 as IconSun5 } from 'react-icons/md';
import { MdBrightness6 as IconSun6 } from 'react-icons/md';
import { MdBrightness7 as IconSun7 } from 'react-icons/md';

import Theme from '../../theme';
import Types from '../SmartTypes';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';

const IconSuns = [IconSun1, IconSun2, IconSun3, IconSun4, IconSun5, IconSun6, IconSun7];

class SmartState extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'SECOND');
            if (state) {
                this.secondary = {
                    id: state.id
                };
            }
        }

        if (this.secondary && this.props.objects[this.secondary.id] && this.props.objects[this.secondary.id].common) {
            // detect type of secondary info
            const secondary = this.props.objects[this.secondary.id].common;
            if (secondary.role.match(/brightness/i)) {
                this.secondary.icon = val => {
                    if (val > this.secondary.max) {
                        return IconSuns[IconSuns.length - 1];
                    } else
                        if (val < this.secondary.min) {
                            return IconSuns[0];
                        } else {
                            const num = (val - this.secondary.min) / (this.secondary.max - this.secondary.min);
                            return IconSuns[Math.round((IconSuns.length - 1) * num)];
                        }
                };
                this.secondary.iconStyle = { color: '#c3c300' };
            } else {
                this.secondary.iconStyle = {};
            }
            this.secondary.title = secondary.name || this.secondary.id.split('.').pop();
            if (typeof this.secondary.title === 'object') {
                this.secondary.title = this.secondary.title[I18n.getLanguage()] || this.secondary.title.en;
            }
            this.secondary.min = secondary.min === undefined ? 0 : secondary.min;
            this.secondary.max = secondary.max === undefined ? 100 : secondary.max;
            this.secondary.unit = secondary.unit || '';
        }

        if (this.channelInfo.type === Types.window) {
            this.iconOn = IconWindowOpened;
            this.iconOff = IconWindowClosed;
            this.textOn = 'opened';
            this.textOff = 'closed';
            this.showTime = true;
            this.style = {
                width: 60,
                height: 60,
                top: '0.2rem',
                left: '0.2rem'
            };
        } if (this.channelInfo.type === Types.door) {
            this.iconOn = IconDoorOpened;
            this.iconOff = IconDoorClosed;
            this.textOn = 'opened';
            this.textOff = 'closed';
            this.showTime = true;
            this.style = {
                left: '1rem'
            };
        } else if (this.channelInfo.type === Types.motion) {
            this.stateRx.chartSettingsId = this.secondary?.id;
            this.max = 100;
            this.min = 0;
            this.iconOn = IconMotionOn;
            this.iconOff = IconMotionOff;
            this.iconColorOn = 'green';
            this.iconColorOff = 'grey';
            this.textOn = 'motion';
            this.showTime = true;
            this.textOff = '-';
            // this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        } else if (this.channelInfo.type === Types.fireAlarm) {
            this.iconOn = IconFireOn;
            this.iconOff = IconFireOff;
            this.iconColorOn = 'red';
            this.iconColorOff = 'grey';
            this.textOn = 'fire';
            this.showTime = true;
            this.textOff = '-';
            this.hideOnFalse = true;
        } else if (this.channelInfo.type === Types.floodAlarm) {
            this.iconOn = IconFloodOn;
            this.iconOff = IconFloodOff;
            this.iconColorOn = 'blue';
            this.iconColorOff = 'grey';
            this.textOn = 'flood';
            this.textOff = '-';
            this.showTime = true;
            this.hideOnFalse = true;
        }

        this.props.tile.setState({
            isPointer: false
        });

        this.doubleState = true; // used in generic

        this.key = 'smart-state-' + this.id + '-';

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        if (id === this.id) {
            let val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
            const newState = {};
            if (this.state.settings.inverted) {
                val = !val;
            }
            newState[id] = val;

            if (this.showTime && state.lc) {
                this.lastChange = state.lc;
            } else {
                this.lastChange = 0;
            }

            this.setState(newState);
            this.props.tile.setState({
                state: val
            });

            if (this.hideOnFalse) {
                let someIndicator = false;
                if (this.indicators) {
                    const ids = Object.keys(this.indicators).filter(_id => this.indicators[_id]);
                    someIndicator = !!ids.find(_id => this.state[this.indicators[_id]]);
                }

                this.props.tile.setVisibility(val || someIndicator);
            }
        } else if (this.secondary && this.secondary.id === id) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        settings.unshift({
            name: 'inverted',
            value: this.state.settings.inverted || false,
            type: 'boolean'
        });
        return settings;
    }

    getIcon() {
        const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
        const color = isOn ? this.iconColorOn : this.iconColorOff;
        let style = color ? { color } : {};
        if (this.style) {
            style = Object.assign(style, this.style);
        }
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = <IconAdapter src={this.getDefaultIcon()} alt="icon" style={{ height: '100%', zIndex: 1 }} />;
        } else {
            if (this.state.settings.icon) {
                customIcon = <IconAdapter alt="icon" src={isOn ? this.state.settings.icon : this.state.settings.iconOff || this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />;
            } else {
                const Icon = isOn ? this.iconOn : this.iconOff;
                customIcon = <Icon className={clsGeneric.iconStyle} />;
            }
        }
        return SmartGeneric.renderIcon(customIcon);
    }

    getStateText() {
        const state = this.state[this.id];
        if (state === undefined || state === null || !this.lastChange || !this.showTime) {
            const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
            return <div className={Utils.clsx(isOn ? cls.textOn : cls.textOff)}>{isOn ? I18n.t(this.textOn) : I18n.t(this.textOff)}</div>;
        } else {
            return <Moment style={{ fontSize: 12 }} date={this.lastChange} interval={15} fromNow locale={I18n.getLanguage()} />;
        }
    }

    getSecondaryDiv() {
        if (!this.secondary || !this.secondary.id || this.state[this.secondary.id] === undefined || this.state[this.secondary.id] === null) {
            return null;
        }
        let val = this.state[this.secondary.id];
        const Icon = (typeof this.secondary.icon === 'function') ? this.secondary.icon.call(this, val) : this.secondary.icon;
        if (typeof val === 'number') {
            val = Math.round(val * 100) / 100;
            val = this.roundValue(val);
        }
        return <div key={this.key + 'tile-secondary'} className="tile-text-second" style={Theme.tile.secondary.div} title={this.secondary.title}>
            {Icon ? <Icon style={Object.assign({}, Theme.tile.secondary.icon, this.secondary.iconStyle)} /> : null}
            <span style={Theme.tile.secondary.text}>{val + (this.secondary.unit ? ' ' + this.secondary.unit : '')}</span>
        </div>;

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
        this.setState({ executing: this.state.settings.noAck ? false : true, [this.secondary.id]: percent });
        this.props.onControl(this.secondary.id, this.percentToRealValue(percent));
    }

    percentToRealValue(percent) {
        percent = parseFloat(percent);
        return Math.round((this.max - this.min) * percent / 100);
    }

    realValueToPercent(val) {
        if (val === undefined) {
            if (this.props.states[this.secondary.id]) {
                val = this.props.states[this.secondary.id].val || 0;
            } else {
                val = 0;
            }
        }
        val = parseFloat(val);
        return Math.round((val - this.min) / (this.max - this.min) * 100);
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.actualId),
            this.getSecondaryDiv(),
            // this.channelInfo.type === Types.motion &&
            //     this.state.showDialog ?
            //     <Dialog key={this.key + 'dialog'}
            //         transparent
            //         windowWidth={this.props.windowWidth}
            //         startValue={this.state[this.secondary.id]}
            //         onValueChange={this.setValue}
            //         // startToggleValue={this.onActualId ? this.state[this.onActualId] : false}
            //         // onToggle={this.onId && this.onToggleValue}
            //         onClose={this.onDialogClose}
            //         type={Dialog.types.dimmer}
            //     /> : null
        ]);
    }
}

export default SmartState;

