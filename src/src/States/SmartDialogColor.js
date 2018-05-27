import React, {Component} from 'react';
import ColorsImg from '../assets/rgb.png';
import {decomposeColor} from 'material-ui/utils/colorManipulator';


class SmartDialogColor extends Component  {

    static buttonColorStyle = {
        position: 'absolute',
        left: 'calc(50% + 7em)',
        bottom: '4em',
        height: '2.5em',
        width: '2.5em',
        cursor: 'pointer'
    };
    static handlerSize = 32;
    // expected:
    // onValueChange
    // onColorChange
    // onClose
    // startValue
    // type
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.startValue || '#00FF00'
        };
        this.state.value = this.state.value.toString();
        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogColor.onContextMenu, false);

        this.refDialog = React.createRef();
        this.refColor  = React.createRef();
        this.refColorCursor = React.createRef();
        this.refColorImage = React.createRef();

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
                if (t < 2/3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r * 255, g * 255, b * 255];
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
        let hsl = SmartDialogColor.rgbToHsl(c.values[0], c.values[1], c.values[2]);
        let h = -hsl[0];
        if (isNaN(h)) h = 0;
        const R =  (size / 2);
        let x = R + Math.cos(Math.PI * 2 * h) * R;
        let y = R + Math.sin(Math.PI * 2 * h) * R;
        return {x, y};
    }

    static posToColor(x, y) {
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
        h = h / 360;
        const rgb = SmartDialogColor.hslToRgb(h, 1, 0.5);
        let r = Math.round(rgb[0]).toString(16);
        let g = Math.round(rgb[1]).toString(16);
        let b = Math.round(rgb[2]).toString(16);
        if (r.length < 2) r = '0' + r;
        if (g.length < 2) g = '0' + g;
        if (b.length < 2) b = '0' + b;
        return '#' + r + g + b;
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
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (!this.colorWidth) {
            const h = this.refColor.current.offsetHeight - 6 * 16;
           /* if (h < this.refColor.current.offsetWidth) {
                this.colorWidth = h;
                this.refColor.current.style.width = this.colorWidth + 'px';
                this.refColor.current.style.left = 'calc(50% - ' + (this.colorWidth / 2) + 'px)';
            }*/
            this.colorWidth = this.refColorImage.current.offsetWidth;
            this.colorLeft = this.refColorImage.current.offsetLeft;
            this.colorTop = this.refColorImage.current.offsetTop;
            let pos = SmartDialogColor.colorToPos(this.state.value, this.colorWidth - SmartDialogColor.handlerSize);
            this.refColorCursor.current.style.top  = this.colorTop + pos.y + (pos.y > 0 ? 0 : -SmartDialogColor.handlerSize) + 'px';
            this.refColorCursor.current.style.left = this.colorLeft + pos.x + (pos.x > 0 ? 0 : -SmartDialogColor.handlerSize) + 'px';
            this.rect = this.refColorImage.current.getBoundingClientRect();
        }
    }
    componentWillUnmount() {
        this.savedParent.appendChild(this.refDialog.current);
    }

    eventToValue(e) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].pageY : e.pageY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].pageX : e.pageX;
        const halfSize = this.colorWidth / 2;
        this.setState({value: SmartDialogColor.posToColor(pageX - this.rect.left - halfSize, pageY - this.rect.top - halfSize)});
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

    generateColor() {
        let pos = SmartDialogColor.colorToPos(this.state.value, this.colorWidth - SmartDialogColor.handlerSize);

        return (
            <div ref={this.refColor}
                  style={{
                    width: this.colorWidth || '20em',
                    position: 'absolute',
                    height: '100%',
                    left: 'calc(50% - ' + (this.colorWidth ? (this.colorWidth / 2) + 'px' : '10em') + ')'
                  }}>
                <img ref={this.refColorImage}
                     src={ColorsImg}//{this.rgb = this.rgb || SmartDialogColor.createRgb(600)}
                     onMouseDown={this.onMouseDown.bind(this)}
                     onTouchStart={this.onMouseDown.bind(this)}
                     style={{
                         position: 'absolute',
                         zIndex: 11,
                         width: '100%',
                         height: 'auto',
                         top: '3em',
                         left: 0}}/>
                <div ref={this.refColorCursor}
                     style={{
                         position: 'absolute',
                         cursor: 'pointer',
                         zIndex: 12,
                         width: SmartDialogColor.handlerSize,
                         height: SmartDialogColor.handlerSize,
                         top:  pos.y + this.colorTop + (pos.y > 0 ? 0 : -SmartDialogColor.handlerSize),
                         left: pos.x + this.colorLeft + (pos.x > 0 ? 0 : -SmartDialogColor.handlerSize),
                         borderRadius: SmartDialogColor.handlerSize,
                         boxSizing: 'border-box',
                         background: this.state.value,
                         border: '2px solid white'
                     }}>
                </div>
            </div>
        );
    }

    render() {
        return (<div ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
            {this.generateColor()}
        </div>);
    }
}

export default SmartDialogColor;