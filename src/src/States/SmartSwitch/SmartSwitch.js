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

import { TiLightbulb as IconLight } from 'react-icons/ti';
import { MdCheck as IconCheck } from 'react-icons/md';
import { MdCancel as IconCancel } from 'react-icons/md';
import IconSwitch from '../../icons/Socket';

import Types from '../SmartTypes';
import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx/dist/clsx';
import CustomSwitch from '../../Components/CustomSwitch';
class SmartSwitch extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;
        }
        if (this.channelInfo) {
            switch (this.channelInfo.type) {
                case Types.light:
                    this.iconOn = IconLight;
                    this.iconOff = IconLight;
                    this.colorOn = Theme.palette.lampOn;
                    this.colorOff = 'inherit';
                    this.style = {};
                    break;

                case Types.socket:
                default:
                    if (this.props.objects[this.id] && this.props.objects[this.id].common && this.props.objects[this.id].common.role === 'switch.active') {
                        this.iconOn = IconCheck;
                        this.iconOff = IconCancel;
                    } else {
                        this.iconOn = IconSwitch;
                        this.iconOff = IconSwitch;
                    }
                    this.colorOn = Theme.palette.lampOn;
                    this.colorOff = 'inherit';
                    this.backOn = Theme.palette.lampOn;
                    this.backOff = 'gray';
                    this.style = { left: '1rem' };
                    break;
            }
        }

        this.props.tile.setState({
            isPointer: true
        });
        this.key = 'smart-switch-' + this.id + '-';
        this.doubleState = true; // used in generic
        this.noAck = true;  // used in generic

        this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        const newState = {};
        if (!state) {
            return;
        }
        const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        if (id === this.actualId || (this.id === id && this.id === this.actualId && state.ack)) {
            newState[id] = val;
            this.setState(newState);

            if (state.ack && this.state.executing) {
                this.setState({ executing: false });
            }

            this.props.tile.setState({
                state: val
            });
        } else if (id === this.id) {
            newState[id] = val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    toggle = () => {
        if (this.actualId !== this.id) {
            this.setState({ executing: this.state.settings.noAck ? false : true });
        }
        this.props.onControl(this.id, !this.state[this.actualId]);
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        const state = !!this.state[this.actualId];
        let style = state ? { color: this.colorOn } : { color: this.colorOff };
        if (this.style) {
            style = Object.assign(style, this.style);
        }
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} src={state ? this.state.settings.icon : this.state.settings.iconOff || this.state.settings.icon} alt="icon" src={this.getDefaultIcon()} style={{ height: '100%' }} />);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter alt="icon" className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} src={state ? this.state.settings.icon : this.state.settings.iconOff || this.state.settings.icon} style={{ height: '100%' }} />);
            } else {
                const Icon = this.state[this.actualId] ? this.iconOn : this.iconOff;
                customIcon = (<Icon className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} />);
            }
        }
        return SmartGeneric.renderIcon(customIcon, this.state.executing, this.state[this.id]);
    }

    getStateText() {
        return <div className={clsx(clsGeneric.text, this.state[this.id] && clsGeneric.textOn)}>{this.state[this.id] ? I18n.t('On') : I18n.t('Off')}</div>
    }

    getSecondaryDiv() {
        return <div key="secondary" className={cls.wrapperSwitch}><CustomSwitch customValue onChange={this.toggle} value={this.state[this.id]}/></div>
    }

    render() {
        return this.wrapContent(
            [
                this.getStandardContent(this.actualId),
                this.getSecondaryDiv()
            ]);
    }
}

export default SmartSwitch;

