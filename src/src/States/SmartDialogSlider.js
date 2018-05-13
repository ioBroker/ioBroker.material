import React, {Component} from 'react';
import IconColors from '../assets/colors.png';
import Theme from '../theme';
import IconUp from 'react-icons/lib/fa/angle-double-up';
import IconDown from 'react-icons/lib/fa/angle-double-down';
import IconLamp from 'react-icons/lib/ti/lightbulb';
import I18n from '../i18n';
import {darken} from 'material-ui/utils/colorManipulator';


class SmartDialogSlider extends Component  {

    static types = {
        value:  0,
        dimmer: 1,
        blinds: 2,
        color:  3
    };

    static buttonStyle = {
        position: 'absolute',
        left: 'calc(50% - 2em)',
        height: '1.3em',
        width: '4em',
        borderRadius: '1em',
        background: 'white',
        border: '1px solid #b5b5b5',
        paddingTop: '0.1em',
        fontSize: '2em',
        textAlign: 'center',
        cursor: 'pointer'
    };
    static buttonColorStyle = {
        position: 'absolute',
        left: 'calc(50% + 7em)',
        bottom: '4em',
        height: '2.5em',
        width: '2.5em',
        cursor: 'pointer'
    };
    // expected:
    // onValueChange
    // onColorChange
    // onClose
    // startValue
    // type
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.startValue || 0
        };
        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogSlider.onContextMenu, false);

        this.refDialog = React.createRef();
        this.refSlider = React.createRef();

        this.type = this.props.type || SmartDialogSlider.types.dimmer;
    }

    static onContextMenu() {
        return false;
    }

    componentDidMount() {
        // move this element to the top of body
        this.savedParent = this.refDialog.current.parentElement;
        document.body.appendChild(this.refDialog.current);
    }

    componentWillUnmount() {
        this.savedParent.appendChild(this.refDialog.current);
    }

    eventToValue(e) {
        const pageY = e.touches ? e.touches[e.touches.length - 1].pageY : e.pageY;

        let value = Math.round((pageY - this.top) / this.height * 100);
        if (this.props.type !== SmartDialogSlider.types.blinds) {
            value = 100 - value;
        }

        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        this.setState({value});
    }

    onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        this.eventToValue(e);
    }

    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.height) {
            this.height = this.refSlider.current.offsetHeight;
            this.top = this.refSlider.current.offsetTop;
        }

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
            window.removeEventListener('contextmenu', SmartDialogSlider.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }
    getTopButtonName() {
        switch (this.props.type) {
            case SmartDialogSlider.types.blinds:
                return <IconUp style={{color: 'black'}}/>;

            case SmartDialogSlider.types.dimmer:
                return <IconLamp style={{color: Theme.palette.lampOn}} />;

            default:
                return I18n.t('ON');
        }
    }

    getBottomButtonName() {
        switch (this.props.type) {
            case SmartDialogSlider.types.blinds:
                return <IconDown style={{color: 'black'}}/>;

            case SmartDialogSlider.types.dimmer:
                return <IconLamp style={{color: 'black'}} />;

            default:
                return I18n.t('OFF');
        }
    }

    onColorDialog () {
        this.mouseUpTime = Date.now();
    }

    onButtonTop() {
        let value = this.type === SmartDialogSlider.types.blinds ? 0 : 100;
        this.setState({value});
        this.props.onValueChange && this.props.onValueChange(value);
        this.mouseUpTime = Date.now();
    }

    onButtonBottom() {
        let value = this.type === SmartDialogSlider.types.blinds ? 100 : 0;
        this.setState({value});
        this.props.onValueChange && this.props.onValueChange(value);
        this.mouseUpTime = Date.now();
    }

    getSliderColor() {
        if (this.props.type === SmartDialogSlider.types.blinds) {
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1- (val / 70 + 0.3));
        } else {
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1 - (val / 70 + 0.3));
        }
    }

    render() {
        let sliderStyle = {
            position: 'absolute',
            width: '100%',
            left: 0,
            height: this.state.value + '%',
            transitionProperty: 'height',
            transitionDuration: '0.5s',
            background: this.props.background || this.getSliderColor()
        };

        let handlerStyle = {position: 'absolute',
            width: '2em',
            height: '0.3em',
            left: 'calc(50% - 1em)',
            background: 'white',
            borderRadius: '0.4em'
        };

        if (this.props.type === SmartDialogSlider.types.blinds) {
            sliderStyle.top = 0;
            handlerStyle.bottom = '0.4em';
        } else {
            sliderStyle.bottom = 0;
            handlerStyle.top = '0.4em';
        }

        return (
            <div ref={this.refDialog}
                 onClick={this.onClose.bind(this)}
                 style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
                <div style={{width: '16em', position: 'absolute', height: '100%', maxHeight: 600, left: 'calc(50% - 8em)'}}>
                    <div onClick={this.onButtonTop.bind(this)} style={Object.assign({}, SmartDialogSlider.buttonStyle, {top: '1.3em'})} className="dimmer-button">{this.getTopButtonName()}</div>
                    <div ref={this.refSlider}
                        onMouseDown={this.onMouseDown.bind(this)}
                        onTouchStart={this.onMouseDown.bind(this)}
                        style={{position: 'absolute',
                            zIndex: 11,
                            width: 200,
                            border: '1px solid #b5b5b5',
                            borderRadius: '2em',
                            overflow: 'hidden',
                            background: 'white',
                            cursor: 'pointer',
                            height: 'calc(100% - 12em - 48px)',
                            top: 'calc(4em + 48px)',
                            left: 'calc(50% - 100px)'}}>
                        <div style={sliderStyle}>
                            <div style={handlerStyle}>

                            </div>
                        </div>
                        <div style={{position: 'absolute', top: 'calc(50% - 1em)', userSelect: 'none', width: '100%',
                            textAlign: 'center', fontSize: '2em'}}>
                            {this.state.value}%
                        </div>
                    </div>
                    <div onClick={this.onButtonBottom.bind(this)} style={Object.assign({}, SmartDialogSlider.buttonStyle, {bottom: '1.8em'})} className="dimmer-button">{this.getBottomButtonName()}</div>
                    {this.props.type === SmartDialogSlider.types.color ?
                        <div style={SmartDialogSlider.buttonColorStyle} onClick={this.onColorDialog.bind(this)} className="dimmer-button"><img style={{width: '100%', height: '100%'}} src={IconColors}/></div>
                        : null}
                </div>
            </div>);
    }
}

export default SmartDialogSlider;