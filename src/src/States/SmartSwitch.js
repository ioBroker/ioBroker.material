import React from 'react';
import SmartGeneric from './SmartGeneric';
import IconLight from 'react-icons/lib/ti/lightbulb';
import IconSwitch from '../icons/socket.svg';
import Types from './Types';
import Theme from '../theme';
import I18n from '../i18n';

class SmartSwitch extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;
        }
        if (this.channelInfo) {
            switch (this.channelInfo.type) {
                case Types.light:
                    this.iconOn = IconLight;
                    this.iconOff = IconLight;
                    this.colorOn = Theme.palette.lampOn;
                    this.colorOff = 'inherit';
                    this.style = {};
                    break;

                case Types.socket:
                default:
                    this.iconOn = IconSwitch;
                    this.iconOff = IconSwitch;
                    this.colorOn = Theme.palette.lampOn;
                    this.colorOff = 'inherit';
                    this.backOn = Theme.palette.lampOn;
                    this.backOff = 'gray';
                    this.style = {left: '1em'};
                    break;
            }
        }

        this.props.tile.setState({
            isPointer: true
        });

        this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        const newState = {};
        const val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        if (id === this.actualId || (this.id === id && this.id === this.actualId && state.ack)) {
            newState[id] = val;
            this.setState(newState);
            this.props.tile.setState({
                state: val
            });
        } else if (id === this.id) {
            newState[id] = val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    toggle() {
        this.props.onControl(this.id, !this.state[this.actualId]);
    }

    onTileClick() {
        this.toggle();
    }

    getIcon() {
        const Icon = this.state[this.actualId] ? this.iconOn : this.iconOff;
        let style = this.state[this.actualId] ? {color: this.colorOn, background: this.backOn} : {color: this.colorOff, background: this.backOff};
        if (this.style) {
            style = Object.assign(style, this.style);
        }
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, style)} className="tile-icon">
                {typeof Icon !== 'string' ? (<Icon width={'100%'} height={'100%'}/>) : (<img src={Icon} width={'100%'} height={'100%'} />)}
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

export default SmartSwitch;

