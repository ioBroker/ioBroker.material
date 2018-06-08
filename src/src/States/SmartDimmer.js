import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SmartGeneric from './SmartGeneric';
import Icon from 'react-icons/lib/ti/lightbulb'
import Theme from '../theme';
import Slider from './SmartDialogSlider';
import I18n from '../i18n';

class SmartLight extends SmartGeneric {
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
            if (this.max === undefined) {
                this.max = 100;
            }
            this.max = parseFloat(this.max);

            this.min = this.props.objects[this.actualId].common.min;
            if (this.min === undefined) {
                this.min = 0;
            }
            this.min = parseFloat(this.min);

            this.props.tile.setState({
                isPointer: true
            });
        }
        this.stateRx.showDialog = false;
        this.onMouseUpBind = this.onMouseUp.bind(this);

        this.props.tile.registerHandler('onMouseDown', this.onTileMouseDown.bind(this));

        this.slider = null;
        this.stateRx.setValue = null;

        this.componentReady();
    }

    realValueToPercent(val) {
        if (val === undefined) {
            if (this.props.states[this.actualId]) {
                val = this.props.states[this.actualId].val || 0;
            } else {
                val = 0;
            }
        }
        val = parseFloat(val);
        return Math.round((val - this.min) / (this.max - this.min) * 100);
    }

    percentToRealValue(percent) {
        percent = parseFloat(percent);
        return Math.round((this.max - this.min) * percent / 100);
    }

    updateState(id, state) {
        let newState = {};
        const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);

        if (this.actualId === id || (this.id === id && this.id === this.actualId && state.ack)) {
            if (!isNaN(val)) {
                newState[id] = this.realValueToPercent(val);
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

    setValue(percent) {
        if (percent) {
            this.lastNotNullPercent = percent;
        } else {
            const p = this.realValueToPercent();
            if (p) {
                this.lastNotNullPercent = p;
            }
        }

        console.log('Control ' + this.id + ' = ' + this.percentToRealValue(percent));
        this.setState({executing: true, setValue: percent});
        this.props.onControl(this.id, this.percentToRealValue(percent));
    }

    onLongClick() {
        this.timer = null;
        this.setState({showDialog: true});
    }

    onDialogClose() {
        this.setState({showDialog: false});
    }

    onValueChange(newValue) {
        this.setValue(newValue);
    }

    onTileMouseDown(e) {
        if (this.state.showDialog) return;
        e.preventDefault();
        e.stopPropagation();
        this.timer = setTimeout(this.onLongClick.bind(this), 500);
        document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
        document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
    }

    onMouseUp() {
        let newValue;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;

            const percent = this.realValueToPercent();
            if (percent) {
                newValue = 0;
            } else {
                newValue = this.lastNotNullPercent || 100;
            }
            this.setValue(newValue);
        }
        console.log('Stopped');
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});
    }

    getIcon() {
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                <Icon width={'100%'} height={'100%'}/>
                {this.state.executing ? <CircularProgress style={{position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
            </div>
        );
    }

    getStateText() {
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            if (this.workingId && this.state[this.workingId] && this.state.setValue !== null && this.state.setValue !== undefined) {
                return this.realValueToPercent(this.state[this.id]) + '% → ' + this.state.setValue + '%';
            } else {
                return this.realValueToPercent(this.state[this.id]) + '%';
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
                     style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>),
            this.state.showDialog ?
                <Slider key={this.id + '.slider'}
                    startValue={this.realValueToPercent()}
                    onValueChange={this.onValueChange.bind(this)}
                    onClose={this.onDialogClose.bind(this)}
                    type={Slider.types.dimmer}
                /> : null
        ]);
    }
}

export default SmartLight;

