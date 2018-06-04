import React from 'react';
import SmartGeneric from './SmartGeneric';
import IconWindowOpened from '../icons/windowOpened.svg';
import IconWindowClosed from '../icons/windowClosed.svg';
import IconMotionOn from '../icons/motionOn.svg';
import IconMotionOff from '../icons/motionOff.svg';
import IconFireOn from '../icons/fireOn.svg';
import IconFireOff from '../icons/fireOff.svg';
import IconFloodOn from '../icons/floodOn.svg';
import IconFloodOff from '../icons/floodOff.svg';
import IconDoorOpened from '../icons/doorOpened.svg';
import IconDoorClosed from '../icons/doorClosed.svg';

import Theme from '../theme';
import I18n from '../i18n';
import Types from '../States/Types';

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
        }

        if (this.channelInfo.type === Types.window) {
            this.iconOn = IconWindowOpened;
            this.iconOff = IconWindowClosed;
            this.textOn = 'opened';
            this.textOff = 'closed';
            this.style = {
                width: 60,
                height: 60,
                top: '0.2em',
                left: '0.2em'
            };
        } if (this.channelInfo.type === Types.door) {
            this.iconOn = IconDoorOpened;
            this.iconOff = IconDoorClosed;
            this.textOn = 'opened';
            this.textOff = 'closed';
            this.style = {
                left: '1em'
            };
        } else if (this.channelInfo.type === Types.motion) {
            this.iconOn = IconMotionOn;
            this.iconOff = IconMotionOff;
            this.iconColorOn = 'green';
            this.iconColorOff = 'grey';
            this.textOn = 'motion';
            this.textOff = '-';
        } else if (this.channelInfo.type === Types.fireAlarm) {
            this.iconOn = IconFireOn;
            this.iconOff = IconFireOff;
            this.iconColorOn = 'red';
            this.iconColorOff = 'grey';
            this.textOn = 'fire';
            this.textOff = '-';
            this.hideOnFalse = true;
        }  else if (this.channelInfo.type === Types.floodAlarm) {
            this.iconOn = IconFloodOn;
            this.iconOff = IconFloodOff;
            this.iconColorOn = 'blue';
            this.iconColorOff = 'grey';
            this.textOn = 'flood';
            this.textOff = '-';
            this.hideOnFalse = true;
        }

        this.props.tile.setState({
            isPointer: false
        });

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (id === this.id) {
            const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
            const newState = {};
            newState[id] = val;
            this.setState(newState);
            if (this.props.tile.state.state !== val) {
                this.props.tile.setState({
                    state: val
                });
            }
        } else {
            super.updateState(id, state);
        }
        if (this.hideOnFalse) {
            let someIndicator = false;
            if (this.indicators) {
                const ids = Object.keys(this.indicators).filter(_id => this.indicators[_id]);
                someIndicator = ids.find(_id => this.state[this.indicators[_id]]);
            }

            this.props.tile.setState({
                visible: this.state[this.id] || someIndicator
            });
        }
    }

    getIcon() {
        const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
        const Icon = isOn ? this.iconOn : this.iconOff;
        const color = isOn ? this.iconColorOn : this.iconColorOff;
        let style = color ? {color} : {};
        if (this.style) {
            style = Object.assign(style, this.style);
        }

        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, style)} className="tile-icon">
                <img src={Icon} style={{zIndex: 1}} width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
        return isOn ? I18n.t(this.textOn) : I18n.t(this.textOff);
    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectNameCh()}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.actualId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>)
        ]);
    }
}

export default SmartState;

