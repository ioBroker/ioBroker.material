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
import IconButton from 'react-icons/lib/go/diff-modified';
import IconStop from 'react-icons/lib/md/stop';
import IconPlay from 'react-icons/lib/md/play-arrow';
import IconPause from 'react-icons/lib/md/pause';
import IconReplay from 'react-icons/lib/md/replay';
import IconShuffle from 'react-icons/lib/md/shuffle';
import IconMute from 'react-icons/lib/md/volume-mute';
import IconUnmute from 'react-icons/lib/md/volume-up';
import IconForward from 'react-icons/lib/md/fast-forward';
import IconPrev from 'react-icons/lib/md/fast-rewind';

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
        const Icon = this.icon;

        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, this.style)} className="tile-icon">
                <Icon width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        return this.state.pressed ? I18n.t('pressed') : '';
    }

    render() {
        const text = this.getStateText();
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.key + 'tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.state.nameStyle, {height: '4.5em'})}>{this.state.settings.name}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, Theme.tile.tileStateOff, {position: 'absolute', bottom: 0, left :0})}>{text}</div>
            </div>)
        ]);
    }
}

export default SmartButton;

