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
import Fab from '@material-ui/core/Fab';

import SmartGeneric from '../SmartGeneric';
import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';

import { MdPlayArrow as IconPlay } from 'react-icons/md';
import { MdPause as IconPause } from 'react-icons/md';
//import IconChecked from 'react-icons/lib/md/check-circle';
//import IconUnchecked from 'react-icons/lib/md/cancel';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx';
import { IconButton } from '@material-ui/core';

class SmartInstance extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ALIVE');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            const parts = this.id.split('.');
            parts.pop();

            this.instanceNumber = parts[parts.length - 1];
            this.instanceId = parts.join('.');

            if (this.props.objects[this.instanceId].type !== 'instance') {
                this.id = '';
                this.componentReady();
                return;
            }

            if (!this.props.objects[this.instanceId].common.onlyWWW) {
                state = this.channelInfo.states.find(state => state.id && state.name === 'UNREACH');
                this.connectedId = state ? state.id : this.id;
            }
        }

        this.props.tile.setState({
            isPointer: false
        });
        this.key = 'smart-instance-' + this.id + '-';

        // this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }
    updateState(id, state) {
        const newState = {};
        state = state || {};
        const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        if (id === this.id) {
            newState[id] = val;
            if (this.connectedId) {
                if (val) {
                    newState[this.connectedId] = !this.connectedState;
                } else {
                    newState[this.connectedId] = false;
                }
            }

            this.setState(newState);

            this.props.tile.setState({ state: val });
        } else if (id === this.connectedId) {
            this.connectedState = state.val;
            if (this.state[this.id]) {
                state.val = !state.val;
            } else {
                state.val = false;
            }
            super.updateState(id, state);
        } else {
            super.updateState(id, state);
        }
    }
    toggle = () =>
        this.props.onControl(this.instanceId, !this.props.objects[this.instanceId].common.enabled, 'common.enabled');

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        const img = '/' + this.props.objects[this.instanceId].common.name + '.admin/' + this.props.objects[this.instanceId].common.icon;
        // return (
        //     <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon)} className="tile-icon">
        //         <img height={'100%'} src={img} alt={'i' || this.state.settings.name}/>
        //     </div>
        // );
        return SmartGeneric.renderIcon(<IconAdapter className={clsGeneric.iconStyle} src={img} alt={'i' || this.state.settings.name} />);
    }

    getStateText() {
        const common = this.props.objects[this.instanceId].common;
        if (common.onlyWWW) {
            return common.enabled ? I18n.t('enabled') : I18n.t('disabled');
        } else {
            return this.state[this.id] ? I18n.t('running') : I18n.t('stopped');
        }
    }

    getSecondaryDiv() {
        let Icon;
        let text;
        let color;

        if (this.props.objects[this.instanceId].common.enabled) {
            Icon = IconPause;
            text = I18n.t('disable instance');
            color = '#90ee90';
        } else {
            Icon = IconPlay;
            text = I18n.t('enable instance');
            color = '#f99';
        }

        return (<div key={this.key + 'tile-secondary'} className="tile-text-second"
            style={Theme.tile.secondary.button} title={text}>
            <IconButton className={clsx(this.props.objects[this.instanceId].common.enabled ? cls.textOn : cls.buttonOff)} variant="round" size="small" onClick={this.toggle} aria-label={text}>
                <Icon />
            </IconButton>
        </div>);
    }

    render() {
        if (this.props.objects[this.instanceId].type !== 'instance') {
            return null;
        }
        const style = Object.assign(
            {},
            this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff,
            {
                color: this.state[this.id] ? Theme.palette.instanceRunning : Theme.palette.instanceStopped,
                position: 'absolute',
                bottom: 0
            }
        );

        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            this.getSecondaryDiv(),
            (<div key={this.key + 'tile-text'}
                className="tile-text"
                style={Object.assign({}, Theme.tile.tileText, { minHeight: 56 })}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.state.nameStyle)}>{this.state.settings.name}</div>
                <div className="tile-state-text" className={clsx(this.state[this.id] ? cls.textOn : cls.textOff)} >{this.getStateText()}</div>
            </div>)
        ]
        );
    }
}

export default SmartInstance;

