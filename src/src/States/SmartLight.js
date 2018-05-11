import React from 'react';
import SmartGeneric from './SmartGeneric';
import Icon from 'react-icons/lib/ti/lightbulb'
import Theme from '../theme';
import I18n from '../i18n';

class SmartLight extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'LAMP_SET');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'WORKING');
            if (state) {
                this.workingId = state.id;
            } else {
                this.workingId = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'LAMP_ACT');
            if (state) {
                this.actualId = state.id;
            } else {
                this.actualId = this.id;
            }
        }

        this.props.tile.setState({
            isPointer: true
        });

        this.props.registerHandler('onClick', this.onTileClick.bind(this));
    }

    updateState(id, state) {
        if (id === this.actualId || (this.id === this.actualId && state.ack)) {
            const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
            const newState = {};
            newState[this.id] = val;
            this.setState(newState);

            this.props.tile.setState({
                state: val
            });
        } else if (id === this.workingId) {
            const newState = {};
            newState[id] = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on'  || state.val === 'ON';
            this.setState(newState);
        }
    }

    toggle() {
        this.props.onControl(this.id, !this.state[this.actualId]);
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                <Icon width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        return this.state[this.id] ? I18n.t('On') : I18n.t('Off')
    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectNameCh()}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.actualId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>)
        ]
        );
    }
}

export default SmartLight;

