import React, {Component} from 'react';
import Theme from '../theme';
import I18n from '../i18n';
import ThermostatControl from 'react-nest-thermostat';
import SmartDialogColor from "./SmartDialogColor";

class SmartDialogThermostat extends Component  {

    // expected:
    // startValue
    // actualValue
    // onValueChange
    // onClose
    // objects
    // states
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.startValue || 0,
            toast: ''
        };
        this.min = this.props.min;
        if (this.min > this.props.actualValue) {
            this.min = this.props.actualValue
        }
        if (this.min > this.props.startValue) {
            this.min = this.props.startValue
        }
        this.max = this.props.max;
        if (this.max < this.props.actualValue) {
            this.max = this.props.actualValue
        }
        if (this.max < this.props.startValue) {
            this.max = this.props.startValue
        }

        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);
        this.onMouseDownBind = this.onMouseDown.bind(this);

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogThermostat.onContextMenu, false);

        this.refDialog = React.createRef();
        this.refPanel = React.createRef();
        this.svgControl = null;
    }

    static onContextMenu(e) {
        e.preventDefault();
        console.log('Ignore context menu' + e);
        return false;
    }

    componentDidMount() {
        // move this element to the top of body
        this.savedParent = this.refDialog.current.parentElement;
        document.body.appendChild(this.refDialog.current);
        this.svgControl = this.refPanel.current.getElementsByTagName('svg')[0];
        this.svgWidth = this.svgControl.clientWidth;
        this.svgHeight = this.svgControl.clientHeight;
        this.svgCenterX = this.svgWidth / 2;
        this.svgCenterY = this.svgHeight / 2;
        this.rect = this.svgControl.getBoundingClientRect();

        this.svgControl.addEventListener('mousedown', this.onMouseDownBind, {passive: false, capture: true});
        this.svgControl.addEventListener('touchstart', this.onMouseDownBind, {passive: false, capture: true});
    }

    componentWillUnmount() {
        this.savedParent.appendChild(this.refDialog.current);
    }

    posToTemp(x, y) {
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
        h = h * -1;
        if (h < 0) h += 360;
        h = 360 - h;
        // owr sector
        // 60 => 100%
        // 120 => 0%
        // 270 => 50%
        if (h > 60 && h < 90) {
            h = 60;
        }
        if (h > 90 && h < 120) {
            h = 120;
        }
        if (h < 90) {
            h += 360;
        }
        h -= 120;
        h /= 360 - 60;
        return (this.max - this.min) * h + this.min;
    }

    eventToValue(e) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].pageY : e.pageY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].pageX : e.pageX;
        this.setState({value: this.posToTemp(pageX - this.rect.left - this.svgCenterX, pageY - this.rect.top - this.svgCenterY)});
    }

    onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        this.eventToValue(e);
    }

    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        this.eventToValue(e);

        document.addEventListener('mousemove',  this.onMouseMoveBind,   {passive: false, capture: true});
        document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
        document.addEventListener('touchmove',  this.onMouseMoveBind,   {passive: false, capture: true});
        document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
    }

    onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.mouseUpTime = Date.now();
        console.log('Stopped');
        document.removeEventListener('mousemove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchmove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});

        this.props.onValueChange && this.props.onValueChange(this.state.value);
    }


    onClose() {
        if (!this.mouseUpTime || Date.now() - this.mouseUpTime > 100) {
            window.removeEventListener('contextmenu', SmartDialogColor.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }

    handleToastClose() {
        this.setState({toast: ''});
    }

    render() {
        return (<div key={'thermo_dialog'} ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={Theme.dialog.back}>
            <div style={Object.assign({}, Theme.dialog.inner, {overflowY: 'hidden'})} ref={this.refPanel}>
                <ThermostatControl
                    minValue={this.min}
                    maxValue={this.max}
                    hvacMode={'heating'}
                    ambientTemperature={this.props.actualValue}
                    targetTemperature={this.state.value}
                />
            </div>
        </div>);
    }
}

export default SmartDialogThermostat;