import React from 'react';
import Moment from 'react-moment';
import SmartGeneric from './SmartGeneric';
import IconWindowOpened from '../icons/WindowOpened';
import IconWindowClosed from '../icons/WindowClosed';
import IconMotionOn from '../icons/MotionOn';
import IconMotionOff from '../icons/MotionOff';
import IconFireOn from '../icons/FireOn';
import IconFireOff from '../icons/FireOff';
import IconFloodOn from '../icons/FloodOn';
import IconFloodOff from '../icons/FloodOff';
import IconDoorOpened from '../icons/DoorOpened';
import IconDoorClosed from '../icons/DoorClosed';
import IconSun1 from 'react-icons/lib/md/brightness-1';
import IconSun2 from 'react-icons/lib/md/brightness-2';
import IconSun3 from 'react-icons/lib/md/brightness-3';
import IconSun4 from 'react-icons/lib/md/brightness-4';
import IconSun5 from 'react-icons/lib/md/brightness-5';
import IconSun6 from 'react-icons/lib/md/brightness-6';
import IconSun7 from 'react-icons/lib/md/brightness-7';

import Theme from '../theme';
import I18n from '../i18n';
import Types from '../States/Types';

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
                this.secondary  = {
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
                this.secondary.iconStyle = {color: '#c3c300'};
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
                top: '0.2em',
                left: '0.2em'
            };
        } if (this.channelInfo.type === Types.door) {
            this.iconOn = IconDoorOpened;
            this.iconOff = IconDoorClosed;
            this.textOn = 'opened';
            this.textOff = 'closed';
            this.showTime = true;
            this.style = {
                left: '1em'
            };
        } else if (this.channelInfo.type === Types.motion) {
            this.iconOn = IconMotionOn;
            this.iconOff = IconMotionOff;
            this.iconColorOn = 'green';
            this.iconColorOff = 'grey';
            this.textOn = 'motion';
            this.showTime = true;
            this.textOff = '-';
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

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (id === this.id) {
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
        } else if (this.secondary && this.secondary.id === id) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else{
            super.updateState(id, state);
        }
        if (this.hideOnFalse) {
            let someIndicator = false;
            if (this.indicators) {
                const ids = Object.keys(this.indicators).filter(_id => this.indicators[_id]);
                someIndicator = !!ids.find(_id => this.state[this.indicators[_id]]);
            }

            this.props.tile.setVisibility(this.state[this.id] || someIndicator);
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
                <Icon style={{zIndex: 1}} width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        const state = this.state[this.id];
        if (state === undefined || state === null || !this.lastChange || !this.showTime) {
            const isOn = this.state[this.id] === '1' || this.state[this.id] === 1 || this.state[this.id] === true || this.state[this.id] === 'true' || this.state[this.id] === 'on' || this.state[this.id] === 'ON';
            return isOn ? I18n.t(this.textOn) : I18n.t(this.textOff);
        } else {
            return (<Moment style={{fontSize: 12}} date={this.lastChange} interval={15} fromNow locale={I18n.getLanguage()}/>);
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
        }
        return (<div key={this.id + '.tile-secondary'} className="tile-text-second" style={Theme.tile.secondary.div} title={this.secondary.title}>
            {Icon ? (<Icon style={Object.assign({}, Theme.tile.secondary.icon, this.secondary.iconStyle)} />) : null}
            <span style={Theme.tile.secondary.text}>{val + (this.secondary.unit ? ' ' + this.secondary.unit : '')}</span>
        </div>);

    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            this.getSecondaryDiv(),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.nameStyle)}>{this.name}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.actualId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>)
        ]);
    }
}

export default SmartState;

