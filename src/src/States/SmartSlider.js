import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SmartGeneric from './SmartGeneric';
import Icon from 'react-icons/lib/ti/lightbulb'
import Theme from '../theme';
import Dialog from './SmartDialogSlider';

class SmartSlider extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;
        }

        if (this.id) {
            this.max = this.props.objects[this.actualId].common.max;
            this.min = this.props.objects[this.actualId].common.min;

            this.props.tile.setState({
                isPointer: true
            });

            this.unit = this.props.objects[this.actualId].common.unit;
            this.unit = this.unit ? ' ' + this.unit : '';
        }

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;

        this.icon = Icon;

        this.componentReady();
    }

    updateState(id, state) {
        let newState = {};
        const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);

        if (this.actualId === id || (this.id === id && this.id === this.actualId && state.ack)) {
            if (!isNaN(val)) {
                newState[id] = val;
                this.setState(newState);

                const tileState = val !== this.min;
                this.props.tile.setState({
                    state: tileState
                });
            } else {
                newState[id] = null;
                this.setState(newState);
                this.props.tile.setState({
                    state: false
                });
            }

            // hide desired value
            if (this.state.setValue === newState[id] && state.ack) {
                this.setState({setValue: null});
            }

            if (state.ack && this.state.executing) {
                this.setState({executing: false});
            }
        } else if (id === this.id) {
            newState[id] = val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    setValue(value) {
        console.log('Control ' + this.id + ' = ' + value);
        if (this.actualId !== this.id) {
            this.setState({executing: true, setValue: value});
        }
        this.props.onControl(this.id, value);
    }

    getIcon() {
        const _Icon = this.icon;
        if (_Icon) {
            return (
                <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                    <_Icon width={'100%'} height={'100%'}/>
                    {this.state.executing ? <CircularProgress style={{position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    getStateText() {
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            if (this.workingId && this.state[this.workingId] && this.state.setValue !== null && this.state.setValue !== undefined) {
                return this.state[this.id] + this.unit + ' → ' + this.state.setValue + this.unit;
            } else {
                return this.state[this.id] + this.unit;
            }
        }
    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon"
                  style={{pointerEvents: 'none'}}>{this.getIcon()}</div>),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.nameStyle)}>{this.name}</div>
                <div className="tile-state-text"
                     style={Theme.tile.tileState}>{this.getStateText()}</div>
            </div>),
            this.state.showDialog ?
                <Dialog key={this.id + '.slider'}
                    startValue={this.state[this.id]}
                    min={this.min}
                    max={this.max}
                    unit={this.unit}
                    onValueChange={this.setValue.bind(this)}
                    onClose={this.onDialogClose.bind(this)}
                    type={Dialog.types.value}
                /> : null
        ]);
    }
}

export default SmartSlider;

