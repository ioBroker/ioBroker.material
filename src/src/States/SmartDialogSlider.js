import React, {Component} from 'react';
import IconColors from '../assets/colors.png';
import Theme from '../theme';
import IconUp from 'react-icons/lib/fa/angle-double-up';
import IconDown from 'react-icons/lib/fa/angle-double-down';
import IconLamp from 'react-icons/lib/ti/lightbulb';
import I18n from '../i18n';
import {darken, decomposeColor} from 'material-ui/utils/colorManipulator';


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
            value: this.props.startValue || 0,
            isColor: false,
            rgb: this.props.startColor || '#00FF00'
        };
        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogSlider.onContextMenu, false);

        this.refDialog = React.createRef();
        this.refSlider = React.createRef();
        this.refColor  = React.createRef();

        this.type = this.props.type || SmartDialogSlider.types.dimmer;
        this.step = this.props.step || 20;
        this.colorWidth = 0;
        this.colorTop = 0;
        this.colorLeft = 0;
        this.button = {
            time: 0,
            name: '',
            timer: null
        }
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * Taken from here: https://gist.github.com/mjackson/5311256
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return [ h, s, l ];
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * Taken from here: https://gist.github.com/mjackson/5311256
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
     static hslToRgb(h, s, l) {
        let r, g, b;

        if (!s) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [ r * 255, g * 255, b * 255 ];
    }


    static createRgb(size) {
        size = size || 300;
        let rad;
        let oldRad;
        const d2r = Math.PI / 180;
        let c = document.createElement('canvas');
        c.width = c.height = size;
        let ctx = c.getContext('2d');
        let s;
        let t;

        for (let hr = size; hr > 1; hr--) {
            for(let i = 0, oldRad = 0; i < 360; i += 1) {
                rad = (i + 1) * d2r;
                s = hr / size;
                if (s > 0.5) {
                    t = (1 + Math.sin(Math.PI * (s + 0.5) * 2 - Math.PI / 2)) / 2;
                } else {
                    t = 0;
                }

                ctx.strokeStyle = 'hsl(' + (-i) + ', 100%, '+ (50 + (50 - t * 50)) + '%)';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, hr / 2, oldRad, rad + 0.01);
                ctx.stroke();
                oldRad = rad;
            }
        }
        return c.toDataURL();
    }

    static colorToPos(color, size) {
        let c = decomposeColor(color);
        let hsl = SmartDialogSlider.rgbToHsl(c.values[0], c.values[1], c.values[2]);
        let h = -hsl[0];
        let x = (size / 2) + Math.cos(Math.PI * 2 * h);
        let y = (size / 2) + Math.sin(Math.PI * 2 * h);
        return {x, y};
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

    componentDidUpdate() {
        if (this.state.isColor && !this.colorWidth) {
            const h = this.refColor.current.offsetHeight - 6 * 16;
            if (h < this.refColor.current.offsetWidth) {
                this.colorWidth = h;
                this.refColor.current.style.width = this.colorWidth + 'px';
                this.refColor.current.style.left = 'calc(50% - ' + (this.colorWidth / 2) + 'px)';
            } else {
                this.colorWidth = this.refColor.current.offsetWidth;
            }
            this.colorLeft = this.refColor.current.offsetLeft;
            this.colorTop = this.refColor.current.offsetTop;
            this.refColorCursor.current.style.top  = this.refColor.current.offsetTop + 'px';
            this.refColorCursor.current.style.left = this.refColor.current.offsetLeft + 'px';
        }
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
        this.setState({isColor: true});
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
                    value += this.type === SmartDialogSlider.types.blinds ? -this.step : this.step;
                    break;

                case 'bottom':
                    value += this.type === SmartDialogSlider.types.blinds ? this.step : -this.step;
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
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1- (val / 70 + 0.3));
        } else {
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1 - (val / 70 + 0.3));
        }
    }

    generateSlider() {
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

        return (<div style={{width: '16em', position: 'absolute', height: '100%', maxHeight: 600, left: 'calc(50% - 8em)'}}>
            (<div onTouchStart={() => this.onButtonDown('top')}
                  onMouseDown={() => this.onButtonDown('top')}
                  onTouchEnd={this.onButtonUp.bind(this)}
                  onMouseUp={this.onButtonUp.bind(this)}
                  style={Object.assign({}, SmartDialogSlider.buttonStyle, {top: '1.3em'})} className="dimmer-button">{this.getTopButtonName()}</div>
            <div  ref={this.refSlider}
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
            <div onTouchStart={() => this.onButtonDown('bottom')}
                   onMouseDown={() => this.onButtonDown('bottom')}
                   onTouchEnd={this.onButtonUp.bind(this)}
                   onMouseUp={this.onButtonUp.bind(this)}
                   style={Object.assign({}, SmartDialogSlider.buttonStyle, {bottom: '1.8em'})} className="dimmer-button">{this.getBottomButtonName()}</div>),
            {this.props.type === SmartDialogSlider.types.color ?
                (<div  key="dialog-slider-option"  style={SmartDialogSlider.buttonColorStyle} onClick={this.onColorDialog.bind(this)} className="dimmer-button"><img style={{width: '100%', height: '100%'}} src={IconColors}/></div>)
            : null}
        </div>);
    }

    generateColor() {
        let pos = SmartDialogSlider.colorToPos(this.state.rgb, this.colorWidth - 16);

        return (
            <div  ref={this.refColor}
                  style={{
                    width: this.colorWidth || '20em',
                    position: 'absolute',
                    height: '100%',
                    left: 'calc(50% - ' + (this.colorWidth ? this.colorWidth + 'px' : '20em') + ')'
                  }}>
                <img src={this.rgb = this.rgb || SmartDialogSlider.createRgb(600)}
                     onMouseDown={this.onMouseDown.bind(this)}
                     onTouchStart={this.onMouseDown.bind(this)}
                     style={{
                         position: 'absolute',
                         zIndex: 11,
                         width: '100%',
                         height: 'auto',
                         cursor: 'pointer',
                         top: '3em',
                         left: 0}}/>
                <div style={{
                    width: '2em',
                    height: '2em',
                    top: 'calc(3em + ' + pos.y + 'px)',
                    left: 'calc(3em + ' + pos.x + 'px)',
                    borderRadius: '1em',
                    background: this.state.rgb,
                    border: '2px solid gray'
                }}>
                </div>
            </div>
        );
    }

    render() {
        return (<div ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
            {this.state.isColor ? this.generateColor() : this.generateSlider()}
        </div>);
    }
}

export default SmartDialogSlider;