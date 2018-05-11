import React from 'react';
import SmartGeneric from './SmartGeneric';
import Icon from 'react-icons/lib/ti/lightbulb'
import Theme from '../theme';
import I18n from '../i18n';

class SmartLight extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            const state = this.channelInfo.states.find(state => state.id && state.name === 'LAMP');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }
        }

        this.props.tile.setState({
            isPointer: true
        });

        this.props.registerHandler('onClick', this.onTileClick.bind(this));
    }

    updateState(id, state) {
        const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on'  || state.val === 'ON';
        const newState = {};
        newState[this.id] = val;
        this.setState(newState);

        this.props.tile.setState({
            state: val
        });
    }

    toggle() {
        this.props.onControl(this.id, !this.state[this.id]);
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.id] ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                <Icon width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        return this.state[this.id] ? I18n.t('On') : I18n.t('Off')
    }

    getObjectName() {
        const channelId = SmartGeneric.getChannelFromState(this.id);
        if (this.props.objects[channelId] && (this.props.objects[channelId].type === 'channel' || this.props.objects[channelId].type === 'device')) {
            return SmartGeneric.getObjectName(this.props.objects, channelId, null, null, this.props.enumName) || '&nbsp;';
        } else {
            return SmartGeneric.getObjectName(this.props.objects, this.id, null, null, this.props.enumName) || '&nbsp;';
        }
    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectName()}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>)
        ]
        );
    }
}

export default SmartLight;

