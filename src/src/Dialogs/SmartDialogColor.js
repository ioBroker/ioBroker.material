/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
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
import React from 'react';
import {decomposeColor} from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';

import ColorsImg from '../assets/rgb.png';
import SmartDialogGeneric from './SmartDialogGeneric';
import UtilsColors from '../UtilsColors';
import ColorSaturation from '../basic-controls/react-color-saturation/ColorSaturation';

const styles = {
    buttonColorStyle: {
        position: 'absolute',
        left: 'calc(50% + 7rem)',
        bottom: '4em',
        height: '2.5rem',
        width: '2.5rem',
        cursor: 'pointer'
    },
    saturationSlider: {
        width: 'calc(100% - 2rem)',
        position: 'absolute',
        top: '25rem',
        left: 16,
        borderRadius: 15,
        paddingLeft: 5,
        paddingRight: 5
    }
};

class SmartDialogColor extends SmartDialogGeneric  {
    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        onRgbChange:        PropTypes.func,
        onToggle:           PropTypes.func,
        ids:                PropTypes.object,
        startRGB:           PropTypes.string,
        startOn:            PropTypes.bool
    };
    static handlerSize = 32;

    constructor(props) {
        super(props);
        this.stateRx.color = (this.props.startRGB || '#00FF00').toString();
        const [r,g,b] = UtilsColors.hex2array(this.stateRx.color);
        const [h,s,l] = UtilsColors.rgbToHsl(r, g, b);
        this.stateRx.saturation = s * 100;
        
        this.mouseUpTime = 0;
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseUpBind = this.onMouseUp.bind(this);

        this.refColor       = React.createRef();
        this.refColorCursor = React.createRef();
        this.refColorImage  = React.createRef();

        this.colorWidth = 0;
        this.colorTop = 0;
        this.colorLeft = 0;
        this.button = {
            time: 0,
            name: '',
            timer: null
        };
        this.componentReady();
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
        let hsl = UtilsColors.rgbToHsl(c.colors[0], c.colors[1], c.colors[2]);
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
        const rgb = UtilsColors.hslToRgb(h, 1, 0.5);
        let r = Math.round(rgb[0]).toString(16);
        let g = Math.round(rgb[1]).toString(16);
        let b = Math.round(rgb[2]).toString(16);
        if (r.length < 2) r = '0' + r;
        if (g.length < 2) g = '0' + g;
        if (b.length < 2) b = '0' + b;
        return '#' + r + g + b;
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
            let pos = SmartDialogColor.colorToPos(this.state.color, this.colorWidth - SmartDialogColor.handlerSize);
            this.refColorCursor.current.style.top  = this.colorTop + pos.y + (pos.y > 0 ? 0 : -SmartDialogColor.handlerSize) + 'px';
            this.refColorCursor.current.style.left = this.colorLeft + pos.x + (pos.x > 0 ? 0 : -SmartDialogColor.handlerSize) + 'px';
            this.rect = this.refColorImage.current.getBoundingClientRect();
        }
    }

    eventToValue(e) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].pageY : e.pageY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].pageX : e.pageX;
        const halfSize = this.colorWidth / 2;
        const color = SmartDialogColor.posToColor(pageX - this.rect.left - halfSize, pageY - this.rect.top - halfSize);
        this.setState({color});
        if (this.changeTimer) {
            clearTimeout(this.changeTimer);
        }
        if (this.props.onRgbChange) {
            this.changeTimer = setTimeout(color => {
                this.changeTimer = null;
                this.props.onRgbChange(this.getRealValue(color));
            }, 1000, color);
        }
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

        if (this.changeTimer) {
            clearTimeout(this.changeTimer);
        }

        document.removeEventListener('mousemove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchmove',   this.onMouseMoveBind,   {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});

        this.props.onRgbChange && this.props.onRgbChange(this.getRealValue());
    }

    
    getRealValue(rgb, saturation) {
        rgb = rgb || this.state.color;
        saturation = (saturation === null || saturation === undefined) ? this.state.saturation : saturation;
        const [r,g,b] = UtilsColors.hex2array(rgb);
        const [h,s,l] = UtilsColors.rgbToHsl(r, g, b);
        const _rgb = UtilsColors.hslToRgb(h, saturation / 100, l);
        return UtilsColors.rgb2string(_rgb);
    }
    
    onClose() {
        if (!this.mouseUpTime || Date.now() - this.mouseUpTime > 100) {
            window.removeEventListener('contextmenu', SmartDialogColor.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }

    onClick() {
        this.click = Date.now();
    }

    getHue() {
        if (!this.state.color) {
            return '#FFFFFF';
        }
        const [r,g,b] = UtilsColors.hex2array(this.state.color);
        const [h,s,l] = UtilsColors.rgbToHsl(r, g, b);
        return h * 360;
    }
    
    getSaturation() {
        if (!this.state.color) {
            return 100;
        }
        const [r,g,b] = UtilsColors.hex2array(this.state.color);
        const [h,s,l] = UtilsColors.rgbToHsl(r, g, b);
        return s * 100;
    }

    onSaturationChanged(saturation) {
        this.click = Date.now();
        this.mouseUpTime = this.click;
        this.setState({saturation});
        if (this.changeTimer) {
            clearTimeout(this.changeTimer);
        }
        if (this.props.onRgbChange) {
            this.changeTimer = setTimeout(saturation => {
                this.changeTimer = null;
                this.props.onRgbChange(this.getRealValue(null, saturation));
            }, 1000, saturation);
        }
    }

    generateContent() {
        let pos = SmartDialogColor.colorToPos(this.state.color, this.colorWidth - SmartDialogColor.handlerSize);

        return [(
            <div key="color-dialog" ref={this.refColor}
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
                         background: this.state.color,
                         border: '2px solid white'
                     }}>
                </div>
            </div>),
            (<div style={styles.saturationSlider} key="saturation">
                <ColorSaturation hue={this.getHue()} saturation={this.getSaturation()} onChange={this.onSaturationChanged.bind(this)}/>
            </div>)
        ];
    }
}

export default SmartDialogColor;