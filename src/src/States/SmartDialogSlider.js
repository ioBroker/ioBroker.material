import React, {Component} from 'react';
import Theme from '../theme';

class SmartDialogSlider extends Component  {
    // expected:
    // onValueChange
    // onColorChange
    // onClose
    // startValue
    // fromTop
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
        if (!this.props.fromTop) {
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

    render() {
        let sliderStyle = {
            position: 'absolute',
            width: '100%',
            left: 0,
            height: this.state.value + '%',
            background: this.props.background || Theme.palette.lampOn
        };
        if (this.props.fromTop) {
            sliderStyle.top = 0;
        } else {
            sliderStyle.bottom = 0;
        }

        return (
            <div ref={this.refDialog}
                 onClick={this.onClose.bind(this)}
                 style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
                <div ref={this.refSlider}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}
                    style={{position: 'absolute',
                        zIndex: 11,
                        width: 200,
                        borderRadius: '2em',
                        overflow: 'hidden',
                        background: 'white',
                        height: 'calc(100% - 6em - 48px)',
                        top: 'calc(3em + 48px)',
                        left: 'calc(50% - 100px)'}}>
                    <div style={sliderStyle}>
                    </div>
                    <div style={{position: 'absolute', top: 'calc(50% - 1em)', userSelect: 'none', width: '100%',
                        textAlign: 'center', fontSize: '2em'}}>
                        {this.state.value}%
                    </div>
                </div>
            </div>);
    }
}

export default SmartDialogSlider;