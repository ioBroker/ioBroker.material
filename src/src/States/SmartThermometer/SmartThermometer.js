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
import IconThermometer from '../../icons/Thermometer';
import IconHydro from '../../icons/Humidity';

// import Theme from '../../theme';
import { I18n } from '@iobroker/adapter-react-v5';
import IconAdapter from '@iobroker/adapter-react-v5/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
// import { Flag } from '@material-ui/icons';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';

class SmartThermometer extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            // could be only "humidity"
            state = this.channelInfo.states.find(state => state.id && state.name === 'SECOND');
            if (state) {
                this.secondary = {
                    id: state.id
                };
            }
        }

        this.props.tile.state.state = true;
        this.stateRx.showDialogBottom = false
        // if only humidity
        if (!this.secondary &&
            this.props.objects[this.id] &&
            this.props.objects[this.id].common &&
            this.props.objects[this.id].common.role &&
            this.props.objects[this.id].common.role.match(/humidity/i)
        ) {
            this.isHumidityMain = true;
        } else
            if (this.secondary && this.props.objects[this.secondary.id] && this.props.objects[this.secondary.id].common) {
                // detect type of secondary info
                const secondary = this.props.objects[this.secondary.id].common;
                if (secondary.role.match(/humidity/i)) {
                    this.secondary.icon = IconHydro;
                    this.secondary.iconStyle = { color: '#0056c3' };
                } else {
                    this.secondary.iconStyle = {};
                }
                this.secondary.title = secondary.name || this.secondary.id.split('.').pop();
                if (typeof this.secondary.title === 'object') {
                    this.secondary.title = this.secondary.title[I18n.getLanguage()] || this.secondary.title.en;
                }
                this.secondary.unit = secondary.unit ? ' ' + secondary.unit : '';
            }

        if (this.id && this.props.objects[this.id] && this.props.objects[this.id] && this.props.objects[this.id].common.unit) {
            this.unit = ' ' + this.props.objects[this.id].common.unit;
        } else {
            this.unit = '';
        }

        this.props.tile.setState({ isPointer: false });

        this.key = 'smart-thermometer-' + this.id + '-';
        this.stateRx.chartSettingsId = this.settingsId;
        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        if (id === this.id) {
            const newState = {};
            newState[id] = state.val;

            this.setState(newState);
        } else if (this.secondary && this.secondary.id === id) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = <IconAdapter className={clsGeneric.iconStyle} alt="icon" src={this.getDefaultIcon()} style={{ height: '100%', zIndex: 1 }} />;
        } else {
            if (this.state.settings.icon) {
                customIcon = <IconAdapter className={clsGeneric.iconStyle} alt="icon" src={this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />;
            } else {
                customIcon = <IconThermometer className={clsGeneric.iconStyle} />;
            }
        }

        return SmartGeneric.renderIcon(customIcon);
    }

    getSecondaryDiv() {
        if (!this.secondary || !this.secondary.id || this.state[this.secondary.id] === undefined || this.state[this.secondary.id] === null) {
            return null;
        }
        let val = this.state[this.secondary.id];
        const Icon = this.secondary.icon;
        if (typeof val === 'number') {
            val = Math.round(val * 100) / 100;
        }
        return <div key={this.key + 'tile-secondary'} className={cls.tileTextSecond} title={this.secondary.title}>
            {Icon ? <Icon className={cls.iconSecondary} /> : null}
            <span className={cls.textSecondary}>{val + this.secondary.unit}</span>
        </div>;
    }

    getSecondaryDivTop() {
        const state = this.state[this.id];
        let val;
        if (state === null) {
            val = '?';
        } else {
            val = Math.round(state * 100) / 100;
            if (this.commaAsDelimiter) {
                val = val.toString().replace('.', ',') + this.unit;
            } else {
                val = val + this.unit;
            }
        }
        return <div key="top" className={cls.temperature}>{val}</div>;
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.actualId),
            this.getSecondaryDiv(),
            this.getSecondaryDivTop()
        ]);
    }
}

export default SmartThermometer;

