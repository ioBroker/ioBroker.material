/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
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
import SmartGeneric from './SmartGeneric';

import {GoDiffModified as IconButton} from 'react-icons/go';
import {MdStop as IconStop} from 'react-icons/md';
import {MdPlayArrow as IconPlay} from 'react-icons/md';
import {MdPause as IconPause} from 'react-icons/md';
import {MdReplay as IconReplay} from 'react-icons/md';
import {MdShuffle as IconShuffle} from 'react-icons/md';
import {MdVolumeMute as IconMute} from 'react-icons/md';
import {MdVolumeUp as IconUnmute} from 'react-icons/md';
import {MdFastForward as IconForward} from 'react-icons/md';
import {MdFastRewind as IconPrev} from 'react-icons/md';

import Theme from '../theme';
import I18n from '../i18n';

class SmartButton extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }
        }
        this.defaultEnabling = false; // used in the SmartGeneric
        this.stateRx.pressed = false;

        this.icon = IconButton;
        this.style = {};
        let name = this.props.objects && this.props.objects[this.id] && this.props.objects[this.id].common && this.props.objects[this.id].name;
        if (typeof name === 'object') {
            name = name.en;
        }
        let stateName = name + '_' + this.id.split('.').pop();

        if (stateName.match(/play/i)) {
            this.icon = IconPlay;
            this.style = {color: 'green'};
        } else if (stateName.match(/stop/i)) {
            this.icon = IconStop;
            this.style = {color: 'red'};
        } else if (stateName.match(/pause/i)) {
            this.icon = IconPause;
            this.style = {color: 'grey'};
        } else if (stateName.match(/unmute/i)) {
            this.icon = IconUnmute;
            this.style = {color: 'blue'};
        } else if (stateName.match(/mute/i)) {
            this.icon = IconMute;
            this.style = {color: 'blue'};
        } else if (stateName.match(/forw/i)) {
            this.icon = IconForward;
            this.style = {color: 'yellow'};
        } else if (stateName.match(/prev/i)) {
            this.icon = IconPrev;
            this.style = {color: 'yellow'};
        } else if (stateName.match(/replay/i)) {
            this.icon = IconReplay;
        } else if (stateName.match(/shuff/i)) {
            this.icon = IconShuffle;
        }
        this.key = 'smart-button-' + this.id + '-';

        this.props.tile.setState({isPointer: true});
        this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    onTileClick() {
        this.props.onControl(this.id, true);
        this.setState({pressed: true});
        setTimeout(() => this.setState({pressed: false}), 500);
    }

    getIcon() {
        let customIcon;
        if (this.state.settings.useDefaultIcon) {
            customIcon = (<img src={this.getDefaultIcon()} alt="icon" style={{height: '100%'}}/>);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<img src={this.state.settings.icon} alt="icon" style={{height: '100%'}}/>);
            } else {
                const Icon = this.icon;
                customIcon = (<Icon width={'100%'} height={'100%'}/>);
            }
        }
        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, this.style)} className="tile-icon">
                {customIcon}
            </div>
        );
    }

    getStateText() {
        return this.state.pressed ? I18n.t('pressed') : '';
    }

    render() {
        return this.wrapContent(this.getStandardContent(null));
    }
}

export default SmartButton;

