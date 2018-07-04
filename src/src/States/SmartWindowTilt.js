import React from 'react';
import SmartGeneric from './SmartGeneric';
import IconWindowOpened from '../icons/WindowOpened';
import IconWindowClosed from '../icons/WindowClosed';
import IconWindowTilted from '../icons/WindowTilted';
import Theme from '../theme';
import I18n from '../i18n';

const VALUES = {
    closed: [/close/i],
    tilted: [/tilt/i],
    opened: [/open/i]
};

class SmartWindowTilt extends SmartGeneric {
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
        this.values = {
            closed: 0,
            tilted: 1,
            opened: 2
        };

        if (this.id && this.props.objects[this.id] && this.props.objects[this.id].common && this.props.objects[this.id].common.states) {
            const states = this.props.objects[this.id].common.states;
            for (const val in states) {
                if (states.hasOwnProperty(val)) {
                    for (const v in VALUES) {
                        if (VALUES.hasOwnProperty(v) && VALUES[v].find(r => r.test(states[val])) !== undefined) {
                            this.values[v] = parseInt(val, 10);
                            break;
                        }
                    }
                }
            }
        }


        this.props.tile.setState({
            isPointer: false
        });
        this.key = 'smart-window-' + this.id + '-';

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        let val;
        if (typeof state.val !== 'number') {
            const i = parseInt(state.val, 10);
            if (i.toString() === i) {
                val = i;
            } else if (state.val !== null && state.val !== undefined) {
                val = state.val.toString();

                for (const value in VALUES) {
                    if (VALUES.hasOwnProperty(value)) {
                        // eslint-disable-next-line no-loop-func
                        if (VALUES[value].find(r => r.test(val))) {
                            val = value;
                            break;
                        }
                    }
                }
            } else {
                state.val = 0;
            }
        } else {
            val = state.val;
        }
        if (typeof val === 'number') {
            for (const value in this.values) {
                if (this.values.hasOwnProperty(value) && this.values[value] === val) {
                    val = value;
                    break;
                }
            }
        }
        if (typeof val === 'number') {
            val = 'closed';
        }

        if (id === this.id) {
            const newState = {};
            newState[id] = val;
            this.setState(newState);

            if ((!this.props.tile.state.state && val !== 'closed') || (this.props.tile.state.state && val === 'closed')) {
                this.props.tile.setState({
                    state: val !== 'closed'
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
        let Icon;
        switch (this.state[this.id]) {
            case 'opened':
                Icon = IconWindowOpened;
                break;

            case 'tilted':
                Icon = IconWindowTilted;
                break;

            case 'closed':
            default:
                Icon = IconWindowClosed;
                break;
        }

        const iconStyle = {
            width: 60,
            height: 60,
            top: '0.2em',
            left: '0.2em'
        };

        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, iconStyle)} className="tile-icon">
                <Icon style={{zIndex: 1}} width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        if (this.state[this.id]){
            return I18n.t(this.state[this.id]);
        } else {
            return I18n.t('unknown');
        }
    }

    render() {
        return this.wrapContent([
            (<div key={this.key + 'tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            (<div key={this.key + 'tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.state.nameStyle)}>{this.state.settings.name}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.actualId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>)
        ]);
    }
}

export default SmartWindowTilt;

