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
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.style)} className="tile-icon">
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
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.nameStyle, {height: '4.5em'})}>{this.name}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, Theme.tile.tileStateOff, {position: 'absolute', bottom: 0, left :0})}>{text}</div>
            </div>)
        ]);
    }
}

export default SmartButton;

