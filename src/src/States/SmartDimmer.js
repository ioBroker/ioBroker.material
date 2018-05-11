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
        this.state.direction = '';
        this.state.setValue = 0;
        this.mouseValue = 0;

        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        this.props.registerHandler('onMouseDown', this.onTileMouseDown.bind(this));
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
        if (id === this.actualId || (this.id === this.actualId && state.ack)) {
            const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
            if (!isNaN(val)) {
                const newState = {};
                newState[id] = this.realValueToPercent(val);
                this.setState(newState);

                this.props.tile.setState({
                    state: val !== this.min
                });
            } else {

            }
        } else if (id === this.workingId) {
            const newState = {};
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

        console.log('Control ' + this.percentToRealValue(percent));
        this.props.onControl(this.id, this.percentToRealValue(percent));
    }

    onMouseMove(e) {
        let direction = this.state.direction;

        const pageX = e.touches ? e.touches[e.touches.length - 1].pageX : e.pageX;
        const pageY = e.touches ? e.touches[e.touches.length - 1].pageY : e.pageY;

        if (direction === '') {
            const x = Math.abs(this.startX - pageX);
            const y = Math.abs(this.startY - pageY);
            if (!x && !y) return;


            if (false && x > y) {
                direction = 'hor';
            } else {
                direction = 'ver';
            }
            this.setState({direction: direction});
            // make tile white and not opacity
            this.props.tile.setState({state: true});
        }
        if (direction === 'hor') {
            this.mouseValue = (pageX - this.startX) / 2;
        } else {
            this.mouseValue = (this.startY - pageY) / 2;
        }
        let setValue = Math.round(this.startValue + this.mouseValue);
        if (setValue > 100) {
            setValue = 100;
        } else if (setValue < 0) {
            setValue = 0;
        }
        this.setState({setValue: setValue});
    }

    onTileMouseDown(e) {
        e.preventDefault();
        this.mouseValue = 0;
        this.state.direction = '';
        this.startX = e.touches ? e.touches[0].pageX : e.pageX;
        this.startY = e.touches ? e.touches[0].pageY : e.pageY;
        this.startValue = this.realValueToPercent(this.state[this.actualId]) || 0;
        console.log('Started ' + e.pageX  + ' - ' + e.pageY);
        document.addEventListener('mousemove',  this.onMouseMoveBind,   true);
        document.addEventListener('mouseup',    this.onMouseUpBind,     true);
        document.addEventListener('touchmove',  this.onMouseMoveBind,   true);
        document.addEventListener('touchend',   this.onMouseUpBind,     true);
    }

    onMouseUp() {
        let newValue;
        console.log('Stopped');
        document.removeEventListener('mousemove',   this.onMouseMoveBind,   true);
        document.removeEventListener('mouseup',     this.onMouseUpBind,     true);
        document.removeEventListener('touchmove',   this.onMouseMoveBind,   true);
        document.removeEventListener('touchend',    this.onMouseUpBind,     true);

        if (this.state.direction) {
            this.setState({direction: ''});
            newValue = this.state.setValue;
        } else {
            const percent = this.realValueToPercent();
            if (percent) {
                newValue = 0;
            } else {
                newValue = this.lastNotNullPercent || 100;
            }
        }

        this.setValue(newValue);
    }

    getIcon() {
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                <Icon width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            return this.realValueToPercent(this.state[this.id]) + '%';
        }
    }

    render() {
        if (this.props.editMode) {
            return this.wrapContent([
                (<div key={this.id + '.tile-icon'} className="tile-icon" style={{pointerEvents: 'none'}}>{this.getIcon()}</div>),
                (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                    <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectNameCh()}</div>
                    <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
                </div>)
            ]);
        } else
        if (!this.state.direction) {
            return this.wrapContent([
                (<div key={this.id + '.tile-icon'} className="tile-icon" style={{pointerEvents: 'none'}}>{this.getIcon()}</div>),
                (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                    <div className="tile-channel-name" style={Theme.tile.tileName}>{this.getObjectNameCh()}</div>
                    <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.id] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff)}>{this.getStateText()}</div>
                </div>)
            ]);
        } else if (this.state.direction === 'ver') {
            return this.wrapContent([
                (<div key={this.id + '.tile-outter'} style={Object.assign({}, Theme.dimmer.outter)}>
                    <div key={this.id + '.tile-inner'} style={Object.assign({height: this.state.setValue + '%'}, Theme.dimmer.innerVer)}></div>
                    <div key={this.id + '.tile-number'} style={Object.assign({}, Theme.dimmer.value)}>{this.state.setValue}%</div>
                </div>)
            ]);
        } else if (this.state.direction === 'hor') {
            return this.wrapContent([
                (<div key={this.id + '.tile-outter'} style={Object.assign({}, Theme.dimmer.outter)}>
                    <div key={this.id + '.tile-inner'} style={Object.assign({width: this.state.setValue + '%'}, Theme.dimmer.innerHor)}></div>
                    <div key={this.id + '.tile-number'} style={Object.assign({}, Theme.dimmer.value)}>{this.state.setValue}%</div>
                </div>)
            ]);
        }
    }
}

export default SmartLight;

