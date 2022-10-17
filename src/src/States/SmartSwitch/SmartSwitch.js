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

import { TiLightbulb as IconLight } from 'react-icons/ti';
import { MdCheck as IconCheck } from 'react-icons/md';
import { MdCancel as IconCancel } from 'react-icons/md';
import IconSwitch from '../../icons/Socket';

import Types from '../SmartTypes';
import Theme from '../../theme';
import I18n from '@iobroker/adapter-react-v5/i18n';
import IconAdapter from '@iobroker/adapter-react-v5/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx/dist/clsx';
import CustomSwitch from '../../Components/CustomSwitch';
import Dialog from '../../Dialogs/SmartDialogInfo';
import SmartInfo from '../SmartInfo/SmartInfo';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';
import TypeIcon from '../components/TypeIcon';

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

            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');

            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;

            let infoIDs = this.channelInfo.states
                .filter(state => state.name !== 'ACTUAL' && state.name !== 'SET' && !state.indicator)
                .map(state => state?.id || `${parts}.${state.name}`)
                .filter(id => !!this.props.objects[id]);

            // place numbers first
            if (infoIDs.length > 1) {
                infoIDs.sort((a, b) => {
                    const objA = this.props.objects[a];
                    const objB = this.props.objects[b];
                    const typeA = objA && objA.common && objA.common.type;
                    const typeB = objB && objB.common && objB.common.type;
                    if (typeA && !typeB) return 1;
                    if (!typeA && typeB) return -1;
                    if (typeA === 'number' && typeB !== 'number') return -1;
                    if (typeA !== 'number' && typeB === 'number') return 1;
                    return 0;
                });
            }
            const name = this.getObjectNameCh();
            this.infos = infoIDs.map(id => SmartInfo.getObjectAttributes(this.props.objects, id, name));
            if (this.infos.length) {
                this.stateRx.showDialog = false;
            }
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
        this.key = `smart-switch-${this.id}-`;
        this.doubleState = true; // used in generic
        this.noAck = true;  // used in generic

        this.stateRx.showChartBottom = true;
        this.stateRx.chartSettingsId = this.id;

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

    toggle = (_, e) => {
        e && e.stopPropagation();
        if (this.actualId !== this.id) {
            this.setState({ executing: !this.state.settings.noAck });
        }
        this.props.onControl(this.id, !this.state[this.id], null, () => this.setState({ executing: false }));
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        const state = !!this.state[this.actualId];
        /*let style = state ? { color: this.colorOn } : { color: this.colorOff };
        if (this.style) {
            style = Object.assign(style, this.style);
        }*/
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = <IconAdapter className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} alt="icon" src={this.getDefaultIcon()} style={{ height: '100%' }} />;
        } else {
            if (this.state.settings.icon) {
                customIcon = <IconAdapter alt="icon" className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} src={state ? this.state.settings.icon : this.state.settings.iconOff || this.state.settings.icon} style={{ height: '100%' }} />;
            } else {
                const Icon = this.state[this.actualId] ? this.iconOn : this.iconOff;
                customIcon = <Icon className={clsx(clsGeneric.iconStyle, this.state[this.id] && clsGeneric.activeIconStyle)} />;
            }
        }

        return SmartGeneric.renderIcon(customIcon, this.state.executing, this.state[this.id]);
    }

    getStateText() {
        return <div className={clsx(clsGeneric.text, this.state[this.id] && clsGeneric.textOn)}>{this.state[this.id] ? I18n.t('On') : I18n.t('Off')}</div>
    }

    getSecondaryDiv() {
        return <div key="secondary" className={cls.wrapperSwitch}>
            <CustomSwitch customValue onChange={this.toggle} value={this.state[this.id]} />
        </div>;
    }

    render() {
        return this.wrapContent(
            [
                this.getStandardContent(this.actualId),
                this.getSecondaryDiv(),
                this.state.showDialog ?
                    <Dialog
                        key={this.key + 'dialog'}
                        icon
                        open={true}
                        iconType={<TypeIcon type={this.channelInfo.type}/>}
                        transparent
                        dialogKey={this.key + 'dialog'}
                        windowWidth={this.props.windowWidth}
                        points={this.infos}
                        onCollectIds={this.props.onCollectIds}
                        name={this.state.settings.name}
                        onValueChange={this.setValue}
                        onClose={this.onDialogClose}
                        states={this.props.states}
                        checkHistory={this.checkHistory}
                        ///Modal Charts
                        objects={this.props.objects}
                        themeName={this.props.themeName}
                        socket={this.props.socket}
                        openModal={id =>
                            dialogChartCallBack(
                                () => { },
                                id,
                                this.props.socket,
                                this.props.themeType,
                                this.props.systemConfig,
                                this.props.allObjects,
                                [id]
                            )}
                    /> : null
            ]);
    }
}

export default SmartSwitch;

