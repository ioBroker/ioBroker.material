import React from 'react';
import {CircularProgress} from 'material-ui';
import SmartGeneric from './SmartGeneric';
import Icon from 'react-icons/lib/ti/lightbulb'
import Theme from '../theme';
import Slider from './SmartDialogSlider';

class SmartLight extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'LAMP_SET');
            if (state && this.props.objects[state.id]&& this.props.objects[state.id].common) {
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
        this.state.showSlider = false;
        this.onMouseUpBind = this.onMouseUp.bind(this);

        this.props.tile.registerHandler('onMouseDown', this.onTileMouseDown.bind(this));

        this.slider = null;
        this.state.setValue = null;

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
        if (this.actualId === id) {
            const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
            let newState = {};
            if (!isNaN(val)) {
                newState[id] = this.realValueToPercent(val);
                this.setState(newState);

                const tileState = val !== this.min;
                if (this.props.tile.state !== tileState) {
                    this.props.tile.setState({
                        state: tileState
                    });
                }
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
        } else {
            let newState = {};
            newState[id] = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on'  || state.val === 'ON';
            this.setState(newState);
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
        this.setState({showSlider: true});
    }

    onSliderClose() {
        this.setState({showSlider: false});
    }

    onValueChange(newValue) {
        this.setValue(newValue);
    }

    onTileMouseDown(e) {
        if (this.state.showSlider) return;
        e.preventDefault();
        e.stopPropagation();
        this.mouseValue = 0;
        this.timer = setTimeout(this.onLongClick.bind(this), 500);

        this.state.direction = '';
        this.startX = e.touches ? e.touches[0].pageX : e.pageX;
        this.startY = e.touches ? e.touches[0].pageY : e.pageY;
        this.startValue = this.realValueToPercent(this.state[this.actualId]) || 0;
        console.log('Started ' + this.startX  + ' - ' + this.startY);
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
                <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectNameCh()}</div>
                <div className="tile-state-text"
                     style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
            </div>),
            this.state.showSlider ?
                <Slider key={this.id + '.slider'}
                    startValue={this.realValueToPercent()}
                    onValueChange={this.onValueChange.bind(this)}
                    onClose={this.onSliderClose.bind(this)}
                    type={Slider.types.dimmer}
                /> : null
        ]);
    }
}

export default SmartLight;

