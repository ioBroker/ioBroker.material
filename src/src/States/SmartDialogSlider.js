import React, {Component} from 'react';
import Theme from '../theme';
import IconUp from 'react-icons/lib/fa/angle-double-up';
import IconDown from 'react-icons/lib/fa/angle-double-down';
import IconLamp from 'react-icons/lib/ti/lightbulb';
import IconStop from 'react-icons/lib/md/stop'
import I18n from '../i18n';
import {darken} from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

class SmartDialogSlider extends Component  {

    static types = {
        value:  0,
        dimmer: 1,
        blinds: 2
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
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
    };
    static buttonStopStyle = {
        position: 'absolute',
        left: 'calc(50% + 3.5em)',
        bottom: '2.4em',
        height: '2em',
        width: '2em',
        //cursor: 'pointer'
    };
    static sliderStyle = {
        position: 'absolute',
        zIndex: 11,
        width: 200,
        border: '1px solid #b5b5b5',
        borderRadius: '2em',
        overflow: 'hidden',
        background: 'white',
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
        height: 'calc(100% - 12em - 48px)',
        top: 'calc(4em + 48px)',
        left: 'calc(50% - 100px)'
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
            value: this.props.startValue || 0,
            toast: ''
        };
        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogSlider.onContextMenu, false);

        this.refDialog = React.createRef();
        this.refSlider = React.createRef();

        this.type = this.props.type || SmartDialogSlider.types.dimmer;
        this.step = this.props.step || 20;
        this.button = {
            time: 0,
            name: '',
            timer: null,
            timeUp: 0
        }
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
    }

    componentWillUnmount() {
        this.savedParent.appendChild(this.refDialog.current);
    }

    eventToValue(e) {
        const pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.pageY;

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

        this.mouseDown = true;

        if (!this.height) {
            if (this.refSlider.current) {
                this.height = this.refSlider.current.offsetHeight;
                this.top = this.refSlider.current.offsetTop;
            } else {
                return;
            }
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
        this.mouseDown = false;
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

    onButtonDown(buttonName) {
        if (Date.now() - this.button.time < 50) return;
        if (this.button.timer) {
            clearTimeout(this.button.timer);
        }
        this.button = {
            name: buttonName,
            time: Date.now(),
            timer: setTimeout(() => {
                this.button.timer = null;
                let value;
                switch (this.button.name) {
                    case 'top':
                        value = this.type === SmartDialogSlider.types.blinds ? 0 : 100;
                        break;

                    case 'bottom':
                        value = this.type === SmartDialogSlider.types.blinds ? 100 : 0;
                        break;
                    default:
                        break;
                }
                this.setState({value});
                this.props.onValueChange && this.props.onValueChange(value);
            }, 400)
        };
    }
    onButtonUp() {
        if (this.button.timer) {
            clearTimeout(this.button.timer);
            this.button.timer = null;
            let value = this.state.value;
            switch (this.button.name) {
                case 'top':
                    if (value % this.step === 0) {
                        value += this.type === SmartDialogSlider.types.blinds ? -this.step : this.step;
                    } else{
                        value += this.type === SmartDialogSlider.types.blinds ? -(value % this.step) : this.step - value % this.step;
                    }
                    break;

                case 'bottom':
                    if (value % this.step === 0) {
                        value += this.type === SmartDialogSlider.types.blinds ? this.step : -this.step;
                    } else {
                        value += this.type === SmartDialogSlider.types.blinds ? this.step - value % this.step : -(value % this.step);
                    }
                    break;
                default:
                    break;
            }
            if (value > 100) {
                value = 100;
            } else if (value < 0) {
                value = 0;
            }
            this.setState({value});
            this.props.onValueChange && this.props.onValueChange(value);
        }
        this.mouseUpTime = Date.now();
    }

    getSliderColor() {
        if (this.props.type === SmartDialogSlider.types.blinds) {
            return undefined;
        } else if (this.props.type === SmartDialogSlider.types.dimmer) {
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1 - (val / 70 + 0.3));
        } else {
            return Theme.slider.background;
        }
    }

    onStop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({toast: I18n.t('sent')});
        this.props.onStop && this.props.onStop();
    }

    handleToastClose() {
        this.setState({toast: ''});
    }

    generateSlider() {
        let sliderStyle = {
            position: 'absolute',
            width: '100%',
            left: 0,
            height: this.state.value + '%',
            background: this.props.background || this.getSliderColor()
        };
        if (true || !this.mouseDown) {
            sliderStyle.transitionProperty = 'height';
            sliderStyle.transitionDuration = '0.3s';
        }

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
            sliderStyle.backgroundImage = 'linear-gradient(0deg, #949494 4.55%, #c9c9c9 4.55%, #c9c9c9 50%, #949494 50%, #949494 54.55%, #c9c9c9 54.55%, #c9c9c9 100%)';
            sliderStyle.backgroundSize = '44px 44px';
            sliderStyle.backgroundPosition = 'center bottom';
        } else {
            sliderStyle.bottom = 0;
            handlerStyle.top = '0.4em';
        }

        return (
            <div style={{width: '16em', position: 'absolute', height: '100%', maxHeight: 600, left: 'calc(50% - 8em)'}}>
                <div onTouchStart={() => this.onButtonDown('top')}
                  onMouseDown={() => this.onButtonDown('top')}
                  onTouchEnd={this.onButtonUp.bind(this)}
                  onMouseUp={this.onButtonUp.bind(this)}
                  style={Object.assign({}, SmartDialogSlider.buttonStyle, {top: '1.3em'})} className="dimmer-button">{this.getTopButtonName()}</div>
                <div  ref={this.refSlider}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}
                    style={SmartDialogSlider.sliderStyle}>
                    <div style={sliderStyle}>
                        <div style={handlerStyle}>
                        </div>
                    </div>
                    <div style={{position: 'absolute', top: 'calc(50% - 0.55em)', userSelect: 'none', width: '100%',
                        textAlign: 'center', fontSize: '2em'}}>
                        {this.props.type === SmartDialogSlider.types.blinds ? 100 - this.state.value : this.state.value}%
                    </div>
                </div>
                <div onTouchStart={() => this.onButtonDown('bottom')}
                   onMouseDown={() => this.onButtonDown('bottom')}
                   onTouchEnd={this.onButtonUp.bind(this)}
                   onMouseUp={this.onButtonUp.bind(this)}
                   style={Object.assign({}, SmartDialogSlider.buttonStyle, {bottom: '1.8em'})} className="dimmer-button">{this.getBottomButtonName()}</div>
                {this.props.onStop ?
                    <Button
                        variant="fab"
                        color="secondary"
                        aria-label="stop"
                        style={SmartDialogSlider.buttonStopStyle}
                        onClick={this.onStop.bind(this)}
                        className="dimmer-button"><IconStop/></Button>
                    : null}
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={!!this.state.toast}
                    onClose={this.handleToastClose.bind(this)}
                    autoHideDuration={4000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.toast}</span>}
                />
            </div>
        );
    }

    render() {
        return (<div ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
            {this.generateSlider()}
        </div>);
    }
}

export default SmartDialogSlider;