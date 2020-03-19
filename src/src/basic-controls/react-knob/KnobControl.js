/**
 * Copyright 2018-2020 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    knobSurround: {
        boxSizing: 'border-box',
        position: 'relative',
        backgroundColor: 'grey',
        width: '10em',
        height: '10em',
        borderRadius: '50%',
        border: 'solid 0.25em #0e0e0e',
        background: '-webkit-gradient(linear, left bottom, left top, color-stop(0, #1d1d1d), color-stop(1, #131313))',
        boxShadow: '0 0.2em 0.1em 0.05em rgba(255, 255, 255, 0.1) inset, 0 -0.2em 0.1em 0.05em rgba(0, 0, 0, 0.5) inset, 0 0.5em 0.65em 0 rgba(0, 0, 0, 0.3)'
    },
    knobBefore: {
        position: 'absolute',
        top: '50%',
        right: '3%',
        width: '3%',
        height: '3%',
        backgroundColor: '#a8d8f8',
        borderRadius: '50%',
        boxShadow: '0 0 0.4em 0 #79c3f4',
    },
    knob: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        position: 'absolute',
        zIndex: 10
    },
    min: {
        display: 'block',
        fontFamily: 'sans-serif',
        color:  'white',//'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        fontSize: '70%',
        position: 'absolute',
        opacity: '0.5'
    },
    max: {
        display: 'block',
        fontFamily: 'sans-serif',
        color: 'white',//'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        fontSize: '70%',
        position: 'absolute',
        opacity: '0.5'
    },
    tick: {
        height: '0.08em',
        width: '0.6em',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        position: 'absolute',
        right: '-1.5em',
        top: '50%',
        transition: 'all 50ms ease-in',
    },
    value: {
        position: 'absolute',
        top: 'calc(50% - 10px)',
        width: '100%',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#a8d8f8',
        textShadow: '0 0 10px #a8d8f8'//'0 0 0.3em 0.08em #79c3f4',
    }
});

const activeTick = {
    backgroundColor: '#a8d8f8',
    boxShadow: '0 0 0.3em 0.08em #79c3f4',
};
const activeTitleMin = {
    color: '#ffa7a7',
    textShadow: '0 0 0.3em rgba(23,23,23)'//'0 0 0.3em 0.08em #79c3f4',
};
const activeTitleMax = {
    color: '#a8d8f8',
    textShadow: '0 0 0.3em rgba(23,23,23)'//'0 0 0.3em 0.08em #79c3f4',
};
class KnobControl extends Component {
    static propTypes = {
        classes:        PropTypes.object.isRequired,
        unit:           PropTypes.string,
        value:          PropTypes.string.isRequired,
        onChange:       PropTypes.func.isRequired,
        min:            PropTypes.number,
        max:            PropTypes.number,
        ticks:          PropTypes.number,
        style:          PropTypes.object,
        hideValue:      PropTypes.bool,
        angleStart:     PropTypes.number,
        angleEnd:       PropTypes.number,
        ticksNumber:    PropTypes.number,
        parent:         PropTypes.object
    };

    constructor(props) {
        super(props);
        this.type = this.props.type || (typeof this.props.value === 'number' ? 'number' : 'text');
        this.ticksNumber = this.props.ticksNumber || 28;
        this.angleStart  = this.props.angleStart === null || this.props.angleStart === undefined ? 135 : this.props.angleStart;
        this.angleEnd    = this.props.angleEnd   === null || this.props.angleEnd   === undefined ? 45  : this.props.angleEnd;

        this.angleSize = this.angleEnd - this.angleStart;
        if (this.angleSize < 0) {
            this.angleSize += 360;
        }

        this.min = this.props.min || 0;
        this.max = this.props.max || 100;

        this.refKnob = React.createRef();

        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        const value = this.externalValue2localValue(this.props.value);

        this.calcSteps(this.props.ticks || 28);

        this.unit = this.props.unit ? ' ' + this.props.unit : '';

        this.state = {
            value: value,
            activeTick: this.calcActiveTick(value),
            ticksNumber: this.props.ticks || 28
        };
    }

    componentDidUpdate() {
        if (!this.rect) {
            this.knobWidth = this.refKnob.current.offsetWidth;
            this.rect = this.refKnob.current.getBoundingClientRect();
            this.minPos = this.valueToPos(this.angleStart);
            const half = this.rect.width / 2;
            if (this.minPos.x < half && this.minPos.y < half) {
                this.minPos.x -= 13;
                this.minPos.y -= 6;
            } else if (this.minPos.x >= half && this.minPos.y < half) {
                this.minPos.x -= 13;
                this.minPos.y -= 6;
            } else if (this.minPos.x < half && this.minPos.y >= half) {
                this.minPos.x -= 13;
                this.minPos.y -= 6;
            } else if (this.minPos.x >= half && this.minPos.y >= half) {
                this.minPos.x -= 20;
                this.minPos.y -= 6;
            }

            this.maxPos = this.valueToPos(this.angleEnd);
            if (this.maxPos.x < half && this.maxPos.y < half) {
                this.maxPos.x -= 13;
                this.maxPos.y -= 6;
            } else
            if (this.maxPos.x >= half && this.maxPos.y < half) {
                this.maxPos.x -= 13;
                this.maxPos.y -= 6;
            } else
            if (this.maxPos.x < half && this.maxPos.y >= half) {
                this.maxPos.x -= 13;
                this.maxPos.y -= 6;
            } else
            if (this.maxPos.x >= half && this.maxPos.y >= half) {
                this.maxPos.x -= 20;
                this.maxPos.y -= 6;
            }
            this.forceUpdate();
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    posToValue(x, y) {
        let h;
        if (x < 0) {
            h = Math.atan2(y, -x) * 180 / Math.PI;
            if (y > 0) {
                h = 180 - h;
            } else{
                h = 180 - h;
            }
        } else {
            h = Math.atan2(y, x) * 180 / Math.PI;
        }
        //h = h * -1;
        if (h < 0) h += 360;

        h = h - this.angleStart;
        if (h < 0) h += 360;

        h = h % 360;
        if (h > this.angleSize + (this.angleSize * 0.1)) {
            h = 0;
        }  else
        if (h > this.angleSize) {
            h = this.angleSize;
        }

        return h / this.angleSize * 100;
    }

    calcActiveTick(value) {
        if (value === undefined) {
            value = this.state.value;
        }
        return Math.round(value / this.valueStep);

    }

    calcSteps(ticks) {
        ticks = ticks || this.state.ticksNumber;
        this.angleStep = (this.angleSize) / (ticks - 1);
        this.valueStep = 100 / (ticks - 1);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            if (!this.mouseDown) {
                this.setState({value: nextProps.value});
            }
        }
        if (nextProps.ticksNumber !== this.state.ticks) {
            this.setState({ticks: nextProps.ticksNumber});
            this.calcSteps(nextProps.ticksNumber);
        }
    }

    localValue2externalValue(value) {
        return value * (this.max - this.min) / 100 + this.min;
    }

    externalValue2localValue(value) {
        return ((value - this.min) / (this.max - this.min)) * 100;
    }

    drawTicks() {
        const result = [];
        for (let i = 0; i < this.ticksNumber; i++) {
            const style = {transform: 'rotate(' + (this.angleStep * i + this.angleStart) + 'deg)'};

            result.push((<div  key={'tickDiv' + i} className={this.props.classes.knob} style={style}>
                <div key={'tick' + i} className={this.props.classes.tick}
                     style={(i <= this.state.activeTick) ? activeTick : {}}/>
            </div>));
        }
        return result;
    }

    onWheel(e) {
        // return;
        let value = this.state.value;
        if (e.deltaY < 0) {
            value -= this.valueStep;
            if (value < 0) value = 0;
        } else {
            value += this.valueStep;
            if (value > 100) value = 100;
        }
        this.onValueChange(value);
    }

    onValueChange(value) {
        this.setState({value, activeTick: this.calcActiveTick(value)});
        this.props.onChange && this.props.onChange(this.localValue2externalValue(value));
    }

    drawKnob() {
        const angle = this.angleStart + this.angleStep * (this.state.value / this.valueStep);
        // rotate knob
        const style = {
            transform: 'rotate(' + angle + 'deg)'
        };

        return (
            <div className={this.props.classes.knob} style={style}>
                <div className={this.props.classes.knobBefore}/>
            </div>
        );
    }

    drawValue() {
        if (this.props.hideValue) return null;
        return (<div className={this.props.classes.value}>{
            Math.round(this.localValue2externalValue(this.state.value)) + this.unit
        }</div>);
    }

    eventToValue(e) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX;
        const halfSize = this.knobWidth / 2;
        const value = this.posToValue(pageX - this.rect.left - halfSize, pageY - this.rect.top - halfSize);

        this.lastValue = Date.now();

        /*this.setState({
            value: value,
            activeTick: this.calcActiveTick(value)
        });*/

        this.onValueChange(value);
    }

    onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        this.eventToValue(e);
    }

    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        this.mouseDown = true;

        this.eventToValue(e);

        document.addEventListener('mousemove',  this.onMouseMoveBind,   {passive: false, capture: true});
        document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
        document.addEventListener('touchmove',  this.onMouseMoveBind,   {passive: false, capture: true});
        document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
    }

    onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();

        this.mouseDown = false;

        console.log('Stopped');

        document.removeEventListener('mousemove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchmove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});

        this.props.onChange && this.props.onChange(this.localValue2externalValue(this.state.value));
    }

    valueToPos(angle) {
        const halfSize = this.rect.width / 2;
        const x = (halfSize + 40) * Math.cos((Math.PI / 180) * angle) + halfSize;
        const y = (halfSize + 40) * Math.sin((Math.PI / 180) * angle) + halfSize;
        return {x, y};
    }

    drawMinMax() {
        if (!this.minPos) return;

        let styleMin = Object.assign({}, !this.state.value        ? activeTitleMin : {}, {left: this.minPos.x, top: this.minPos.y});
        let styleMax = Object.assign({}, this.state.value === 100 ? activeTitleMax : {}, {left: this.maxPos.x, top: this.maxPos.y});

        return [
            (<span key="min" className={this.props.classes.min} style={styleMin}>Min</span>),
            (<span key="max" className={this.props.classes.max} style={styleMax}>Max</span>)
        ];

    }
    render() {
        return (
            <div ref={this.refKnob}
                 style={this.props.style}

                 onMouseDown={this.onMouseDown.bind(this)}
                 onTouchStart={this.onMouseDown.bind(this)}

                 className={this.props.classes.knobSurround} onWheel={this.onWheel.bind(this)}>
                {this.drawMinMax()}
                {this.drawKnob()}


                {this.drawValue()}
                <div className={this.props.classes.knob}>
                    {this.drawTicks()}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(KnobControl);
