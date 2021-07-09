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
import Moment from 'react-moment';
import SmartGeneric from '../SmartGeneric';
import { GiGate as IconLockClosed } from "react-icons/gi";
import { GiOpenGate as IconLockOpened } from "react-icons/gi";
import { GiStopSign as IconDoorOpened } from "react-icons/gi";
// import {MdLock as IconLockClosed} from 'react-icons/md';
// import {MdLockOpen as IconLockOpened} from 'react-icons/md';
import { MdClose as IconClose } from 'react-icons/md'
// import IconDoorOpened from '../../icons/DoorOpened';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';

import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';
import CustomFab from '../components/CustomFab';

const style = {
    icon: {
        fontSize: 32
    }
};

class SmartLock extends SmartGeneric {
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
            this.actualId = state?.id || `${parts}.ACTUAL`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STOP');
            this.openId = state && state.id;

            if (this.actualId) {
                const common = this.props.objects[this.actualId] && this.props.objects[this.actualId].common;
                this.actualUnit = common?.unit || '%';
            }
        }

        this.props.tile.setState({
            isPointer: true
        });

        this.stateRx.dialog = false;

        this.key = 'smart-lock-' + this.id + '-';
        this.iconColorOn = Theme.palette.lampOn;
        this.iconColorOff = '';
        this.textOn = 'opened';
        this.textOff = 'closed';
        this.doubleState = true; // used in generic

        this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        if (id === this.actualId) {
            const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
            const newState = {};
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
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
        const color = isOn ? this.iconColorOn : this.iconColorOff;
        let style = color ? { color } : {};
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = <IconAdapter src={this.getDefaultIcon()} alt="icon" style={{ height: '100%', zIndex: 1 }} />;
        } else {
            if (this.state.settings.icon) {
                customIcon = <IconAdapter alt="icon" src={isOn ? this.state.settings.icon : this.state.settings.iconOff || this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />;
            } else {
                const Icon = isOn ? IconLockOpened : IconLockClosed;
                customIcon = <Icon className={clsGeneric.iconStyle} />;
            }
        }

        return SmartGeneric.renderIcon(customIcon);
    }

    getStateText() {
        const state = this.state[this.id];
        if (state === undefined || state === null || !this.lastChange || !this.showTime) {
            const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
            return isOn ? I18n.t(this.textOn) : I18n.t(this.textOff);
        } else {
            return <Moment style={{ fontSize: 12 }} date={this.lastChange} interval={15} fromNow locale={I18n.getLanguage()} />;
        }
    }

    onTileClick() {
        this.setState({ dialog: true });
    }

    onAction(action) {
        switch (action) {
            case 'openGate':
                this.props.onControl(this.id, true);
                break;

            case 'closeGate':
                this.props.onControl(this.id, false);
                break;

            case 'stopGate':
                this.props.onControl(this.openId, true);
                break;

            default:
                break;
        }
        // No idea why direct control does not work
        setTimeout(() => {
            this.setState({ dialog: false });
        }, 0);
    }

    getSecondaryDivTop() {
        return <>
            {this.state[this.actualId] !== undefined && <div className={cls.percent}>{this.state[this.actualId]}{this.state[this.actualId] && this.actualUnit}</div>}
        </>
    }

    getDialog() {
        return <Dialog
            key={this.key + 'tile-dialog'}
            style={{ zIndex: 2101 }}
            open={this.state.dialog}
            classes={{
                paper: cls.paper
            }}
            BackdropProps={{
                classes: {
                    root: cls.filterBlur,
                },
            }}
            onEscapeKeyDown={() => this.setState({ dialog: false })}
        >
            <DialogTitle style={{ textAlign: 'center' }}>
                {I18n.t('Select action')}
                <CustomFab className={cls.button} active onClick={() => this.onAction('close')} size="small" autoFocus>
                    <IconClose />
                </CustomFab>
            </DialogTitle>
            <DialogActions>
                <Button style={style.icon} title={I18n.t('Open gate')} onClick={() => this.onAction('openGate')} color={this.state[this.id] ? 'primary' : 'secondary'}><IconLockOpened /></Button>
                <Button style={style.icon} title={I18n.t('Close gate')} onClick={() => this.onAction('closeGate')} color={!this.state[this.id] ? 'primary' : 'secondary'} autoFocus><IconLockClosed /></Button>
                {this.openId ? <Button style={style.icon} title={I18n.t('Stop gate')} onClick={() => this.onAction('stopGate')} color="secondary"><IconDoorOpened width={32} height={32} /></Button> : null}
            </DialogActions>
        </Dialog>;
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.actualId),
            this.getSecondaryDivTop(),
            this.state.dialog ? this.getDialog() : null
        ]);
    }
}

export default SmartLock;

