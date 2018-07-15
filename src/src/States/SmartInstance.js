import React from 'react';
import SmartGeneric from './SmartGeneric';
import IconLight from 'react-icons/lib/ti/lightbulb';
import IconSwitch from '../icons/Socket';
import Types from './SmartTypes';
import Theme from '../theme';
import I18n from '../i18n';
import CircularProgress from '@material-ui/core/CircularProgress';

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

            state = this.channelInfo.states.find(state => state.id && state.name === 'CONNECTED');
            this.connectedId = state ? state.id : this.id;
        }

        this.props.tile.setState({
            isPointer: true
        });
        this.key = 'smart-instance-' + this.id + '-';

        this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }
    updateState(id, state) {
        const newState = {};
        const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        if (id === this.id) {
            newState[id] = val;
            this.setState(newState);

            this.props.tile.setState({
                state: val
            });
        } else {
            super.updateState(id, state);
        }
    }
    toggle() {
        this.props.onControl(this.id, !this.state[this.id]);
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        const img = '/' + this.props.objects[this.instanceId].common.name + '.admin/' + this.props.objects[this.instanceId].common.icon;
        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon)} className="tile-icon">
                <img width={'100%'} height={'100%'} src={img} alt={this.state.settings.name}/>
                {this.state.executing ? <CircularProgress style={{zIndex: 3, position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
            </div>
        );
    }

    getStateText() {
        const common = this.props.objects[this.instanceId].common;
        if (common.onlyWWW) {
            return common.enabled ? I18n.t('enabled') : I18n.t('disabled');
        } else {
            return this.state[this.id] ? I18n.t('running') : I18n.t('stopped');
        }
    }

    render() {
        const style = this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff;
        Object.assign(style, {color: this.state[this.id] ? 'green' : 'red'});
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.key + 'tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.state.nameStyle)}>{this.state.settings.name}</div>
                <div className="tile-state-text"   style={Object.assign({}, Theme.tile.tileState, style)}>{this.getStateText()}</div>
            </div>)
        ]
        );
    }
}

export default SmartInstance;

