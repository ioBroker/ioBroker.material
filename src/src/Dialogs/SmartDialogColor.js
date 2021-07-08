/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
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
import { decomposeColor } from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';

import ColorsTempImg from '../assets/tempColor.png';
import ColorsImg from '../assets/rgb.png';
import SmartDialogGeneric from './SmartDialogGeneric';
import UtilsColors from '../UtilsColors';
import ColorSaturation from '../basic-controls/react-color-saturation/ColorSaturation';
import { TiLightbulb as IconLight } from 'react-icons/ti';
import { TiThermometer as IconTemp } from 'react-icons/ti';
import { MdColorLens as IconRGB } from 'react-icons/md';
import I18n from '@iobroker/adapter-react/i18n';
import { withStyles } from '@material-ui/core/styles/index';
import cls from './style.module.scss';
import CustomSlider from '../States/components/CustomSlider';
import clsx from 'clsx';
import CustomFab from '../States/components/CustomFab';

const HANDLER_SIZE = 30;
const styles = {
    buttonColorStyle: {
        position: 'absolute',
        left: 'calc(50% + 7rem)',
        bottom: '4rem',
        height: '2.5rem',
        width: '2.5rem',
        cursor: 'pointer'
    },
    dimmerSlider: {
        width: 'calc(100% - 3rem)',
        position: 'absolute',
        top: '25rem',
        left: 16
    },
    buttonOnOff: {
        position: 'absolute',
        left: 5,
        top: 5,
        //        height: 24,
        //        width: 36,
        background: '-webkit-gradient(linear, left bottom, left top, color-stop(0, #1d1d1d), color-stop(1, #131313))',
        boxShadow: '0 0.2em 0.1em 0.05em rgba(255, 255, 255, 0.1) inset, 0 -0.2em 0.1em 0.05em rgba(0, 0, 0, 0.5) inset, 0 0.5em 0.65em 0 rgba(0, 0, 0, 0.3)',
        color: 'rgb(99, 99, 99)',
        textShadow: '0 0 0.3em rgba(23,23,23)'
    },
    button: {
        width: 36,
        height: 36,
    },
    buttonOn: {
        color: '#3f3f3f',
        background: '#F8E900'
    },
    buttonOff: {
        color: '#ffffff',
        background: '#c0bdbe'
    },
    buttonColor: {
        position: 'absolute',
        left: 50,
        top: 5,
        //        height: 24,
        //        width: 36,
        background: '-webkit-gradient(linear, left bottom, left top, color-stop(0, #1d1d1d), color-stop(1, #131313))',
        boxShadow: '0 0.2em 0.1em 0.05em rgba(255, 255, 255, 0.1) inset, 0 -0.2em 0.1em 0.05em rgba(0, 0, 0, 0.5) inset, 0 0.5em 0.65em 0 rgba(0, 0, 0, 0.3)',
        color: 'rgb(99, 99, 99)',
        textShadow: '0 0 0.3em rgba(23,23,23)'
    },
    buttonRgb: {
        color: '#ffffff',
        background: '#ff6a5b'
    },
    buttonTemp: {
        color: '#ffffff',
        background: '#c0bdbe'
    },
    cursor: {
        position: 'absolute',
        cursor: 'pointer',
        zIndex: 12,
        pointerEvents: 'none',
        width: HANDLER_SIZE,
        height: HANDLER_SIZE,
        borderRadius: HANDLER_SIZE,
        boxSizing: 'border-box'
    },
    colorCircle: {
        position: 'absolute',
        zIndex: 11,
        width: '100%',
        height: 'auto',
        top: '3rem',
        left: 0
    },
    div: {
        width: '20rem',
        position: 'absolute',
        height: '100%',
    }
};

const HEIGHT_HEADER = 64;
const HEIGHT_COLOR = 320;
const HEIGHT_DIMMER = 64;
let isDrawing = false;
class SmartDialogColor extends SmartDialogGeneric {
    // expected:
    static propTypes = {
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        windowWidth: PropTypes.number,
        onClose: PropTypes.func.isRequired,
        onRgbChange: PropTypes.func,
        onDimmerChange: PropTypes.func,
        onToggle: PropTypes.func,
        ids: PropTypes.object,
        startRGB: PropTypes.string,
        startTemp: PropTypes.number,
        startModeTemp: PropTypes.bool,

        modeRGB: PropTypes.bool,
        modeTemperature: PropTypes.bool,

        startDimmer: PropTypes.number,
        useDimmer: PropTypes.bool,
        startOn: PropTypes.bool,
        useOn: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.tMin = this.props.temperatureMin || 2200;
        this.tMax = this.props.temperatureMax || 6500;
        this.stateRx.color = (this.props.startRGB || '#00FF00').toString();
        this.stateRx.temperature = this.props.startTemp || UtilsColors.rgb2temperature(this.stateRx.color);
        this.stateRx.dimmer = this.props.useDimmer ? (this.props.startDimmer === null ? 100 : parseFloat(this.props.startDimmer) || 0) : 0;
        this.stateRx.on = this.props.useOn ? (this.props.startOn === null ? true : !!this.props.startOn) : true;
        this.stateRx.tempMode = (this.props.startModeTemp && this.props.modeTemperature) || (!this.props.modeRGB && this.props.modeTemperature);

        this.refColor = React.createRef();
        this.refColorCursor = React.createRef();
        this.refColorImage = React.createRef();

        this.colorWidth = 0;
        this.colorTop = 0;
        this.colorLeft = 0;
        this.button = {
            time: 0,
            name: '',
            timer: null
        };
        if (this.stateRx.tempMode) {
            this.dialogStyle = { background: 'rgba(154, 154, 154, 0.8)' };
        }

        this.setMaxHeight();
        this.componentReady();
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed = false;
        if (props.startOn !== state.on) {
            newState.on = props.startOn;
            changed = true;
        }
        /*if (props.startDimmer !== state.dimmer) {
            newState.dimmer = props.startDimmer;
            changed = true;
        }
        if (props.startRGB !== state.color) {
            newState.color = props.startRGB;
            changed = true;
        }*/
        return changed ? newState : null;
    }

    setMaxHeight() {
        let maxHeight = 0;

        this.divs = {
            header: { height: HEIGHT_HEADER, visible: true },
            color: { height: HEIGHT_COLOR, visible: true },
            dimmer: { height: HEIGHT_DIMMER, visible: this.props.useDimmer }
        };

        // calculate positions
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                maxHeight += this.divs[name].height + 16;
            }
        }

        if (this.dialogStyle.maxHeight !== maxHeight) {
            this.dialogStyle.maxHeight = maxHeight;
        }
    }

    // static createRgb(size) {
    //     size = size || 300;
    //     let rad;
    //     let oldRad;
    //     const d2r = Math.PI / 180;
    //     let c = document.createElement('canvas');
    //     c.width = c.height = size;
    //     let ctx = c.getContext('2d');
    //     let s;
    //     let t;

    //     for (let hr = size; hr > 1; hr--) {
    //         oldRad = 0;
    //         for (let i = 0; i < 360; i += 1) {
    //             rad = (i + 1) * d2r;
    //             s = hr / size;
    //             if (s > 0.5) {
    //                 t = (1 + Math.sin(Math.PI * (s + 0.5) * 2 - Math.PI / 2)) / 2;
    //             } else {
    //                 t = 0;
    //             }

    //             ctx.strokeStyle = 'hsl(' + (-i) + ', 100%, ' + (50 + (50 - t * 50)) + '%)';
    //             ctx.beginPath();
    //             ctx.arc(size / 2, size / 2, hr / 2, oldRad, rad + 0.01);
    //             ctx.stroke();
    //             oldRad = rad;
    //         }
    //     }
    //     return c.toDataURL();
    // }

    // createCT(size) {
    //     size = size || 300;
    //     let rad;
    //     let oldRad;
    //     const d2r = Math.PI / 180;
    //     let c = document.createElement('canvas');
    //     c.width = c.height = size;
    //     let ctx = c.getContext('2d');

    //     for (let hr = size; hr > size * 0.8; hr--) {
    //         oldRad = 120 * d2r;
    //         for (let i = 0; i < 300; i += 1) {
    //             rad = (i + 120 + 1) * d2r;
    //             //s = 100 - Math.round(hr / size * 100);

    //             const rgb = UtilsColors.temperatureToRGB((i / 300) * (this.tMax - this.tMin) + this.tMin);
    //             ctx.strokeStyle = UtilsColors.rgb2string(rgb);
    //             ctx.beginPath();
    //             ctx.arc(size / 2, size / 2, hr / 2 * 0.99, oldRad, rad + 0.01);
    //             ctx.stroke();
    //             oldRad = rad;
    //         }

    //     }
    //     return c.toDataURL();
    // }

    tempToPos(temp, size) {
        let ratio = (temp - this.tMin) / (this.tMax - this.tMin);
        let h = (300 * ratio + 120) / 360;
        const R = (size / 2);
        let x = R + Math.cos(Math.PI * 2 * h) * R;
        let y = R + Math.sin(Math.PI * 2 * h) * R;
        return { x, y };
    }

    posToTemp(x, y) {
        let h;
        if (x < 0) {
            h = Math.atan2(y, -x) * 180 / Math.PI;
            h = 180 - h;
        } else {
            h = Math.atan2(y, x) * 180 / Math.PI;
        }
        if (h < 0) h += 360;
        if (h > 90) {
            h -= 120;
        } else {
            h += 360 - 120;
        }

        if (h < 0) h = 0;
        if (h > 300) h = 300;
        h = h / 300; // => 0-1
        return h * (this.tMax - this.tMin) + this.tMin;
    }

    static colorToPos(color, size) {
        let c = decomposeColor(color);
        let hsl = UtilsColors.rgbToHsl(c.values[0], c.values[1], c.values[2]);
        let h = -hsl[0];
        if (isNaN(h)) h = 0;
        const R = (size / 2);
        let x = R + Math.cos(Math.PI * 2 * h) * R;
        let y = R + Math.sin(Math.PI * 2 * h) * R;
        return { x, y };
    }

    static posToColor(x, y) {
        let h;
        if (x < 0) {
            h = Math.atan2(y, -x) * 180 / Math.PI;
            if (y > 0) {
                h = 180 - h;
            } else {
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
        if (!this.colorWidth && !this.state.tempMode) {
            this.updateCursor();
        }
    }

    componentDidMount() {
        // document.getElementById('root').className = `blurDialogOpen`;
        if (this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }
        if (this.props.modeRGB) {
            this.renderGenerateContent();
        }
    }

    renderGenerateContent() {
        if (this.refColorImage.current && !this.checkRef) {
            this.checkRef = true;
            this.updateCursor();
        } else if (!this.refColorImage.current && !this.checkRef) {
            setTimeout(() => {
                this.renderGenerateContent();
            }, 100);
        }
    }

    updateCursor = () => {
        this.colorWidth = this.refColorImage.current.offsetWidth;
        this.colorLeft = this.refColorImage.current.offsetLeft;
        this.colorTop = this.refColorImage.current.offsetTop;
        let pos = SmartDialogColor.colorToPos(this.state.color, this.colorWidth - HANDLER_SIZE);
        this.refColorCursor.current.style.top = pos.y + (pos.y > 0 ? 0 : -HANDLER_SIZE) + 'px';
        this.refColorCursor.current.style.left = pos.x + (pos.x > 0 ? 0 : -HANDLER_SIZE) + 'px';
        this.rect = this.refColorImage.current.getBoundingClientRect();
    }

    dragCursor = () => {
        let pos = SmartDialogColor.colorToPos(this.state.color, this.colorWidth - HANDLER_SIZE);
        this.refColorCursor.current.style.top = !isNaN(pos.y) ? pos.y + (pos.y > 0 ? 0 : -HANDLER_SIZE) + 'px' : 0;//
        this.refColorCursor.current.style.left = !isNaN(pos.x) ? pos.x + (pos.x > 0 ? 0 : -HANDLER_SIZE) + 'px' : `calc(50% - ${HANDLER_SIZE}px)`;
    }

    sendRGB() {
        if (this.props.useOn && !this.state.on) {
            this.setState({ on: true });
            this.props.onToggle(true);
        }
        if (this.props.useDimmer) {
            if (!this.state.dimmer) {
                this.setState({ dimmer: 100 });
                this.props.onDimmerChange(100);
            }
        }

        if (this.state.tempMode) {
            this.props.onRgbChange(UtilsColors.rgb2string(UtilsColors.temperatureToRGB(this.state.temperature)), Math.round(this.state.temperature), SmartDialogColor.COLOR_MODES.TEMPERATURE);
        } else {
            this.props.onRgbChange(this.state.color, 0, SmartDialogColor.COLOR_MODES.RGB);
        }
    }

    onSwitchColorMode = () => {
        const newState = { tempMode: !this.state.tempMode };
        if (newState.tempMode) {
            // Temperature mode
            const rgb = UtilsColors.hex2array(this.state.color);
            newState.temperature = UtilsColors.rgb2temperature(rgb[0], rgb[1], rgb[2]);
            newState.color = UtilsColors.rgb2string(UtilsColors.temperatureToRGB(this.state.temperature));
            this.setDialogStyle({ background: 'rgba(154, 154, 154, 0.8)', maxHeight: this.dialogStyle.maxHeight });
        } else {
            // Color mode
            newState.color = this.props.startRGB;
            this.setDialogStyle({ maxHeight: this.dialogStyle.maxHeight });
        }

        this.setState(newState, _ => {
            if (!this.state.tempMode) {
                this.updateCursor();
            }
        });
    }

    eventToValue(e) {
        let pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.pageY;
        let pageX = e.touches ? e.touches[e.touches.length - 1].clientX : e.pageX;
        if (!this.rect) {
            this.rect = this.refColorImage.current.getBoundingClientRect();
        }
        const halfSize = this.colorWidth / 2;
        if (this.state.tempMode) {
            // debugger
            const temperature = this.posToTemp(pageX - this.rect.left - halfSize, pageY - this.rect.top - halfSize);
            this.setState({ temperature });
        } else {
            // debugger
            const color = SmartDialogColor.posToColor(pageX - this.rect.left - halfSize, pageY - this.rect.top - halfSize);
            this.setState({ color });
        }

        if (this.changeTimer) {
            clearTimeout(this.changeTimer);
        }
        if (this.props.onRgbChange) {
            this.changeTimer = setTimeout(() => {
                this.changeTimer = null;
                this.sendRGB();
            }, 300);
        }
    }

    onMouseMove = e => {
        if (isDrawing) {
            e.preventDefault();
            e.stopPropagation();
            this.eventToValue(e);
        }
    }

    onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        isDrawing = true;
        this.eventToValue(e);

        document.getElementById('color').addEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('color').addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('color').addEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('color').addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.click = Date.now();

        isDrawing = false;
        if (this.changeTimer) {
            clearTimeout(this.changeTimer);
            this.changeTimer = null;
        }

        document.getElementById('color').removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('color').removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('color').removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('color').removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
        // document.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        // document.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });



        typeof this.sendRGB === 'function' && this.sendRGB();
    }

    onClick() {
        this.click = Date.now();
    }

    getHue() {
        if (this.state.tempMode) {
            return '#FFFFFF';
        }
        let color = this.state.color;
        if (!color) {
            return '#FFFFFF';
        }
        const [r, g, b] = UtilsColors.hex2array(color);
        const [h/*,s,l*/] = UtilsColors.rgbToHsl(r, g, b);
        return h * 360;
    }

    onDimmerChanged = dimmer => {
        this.click = Date.now();
        this.setState({ dimmer });
        this.changeTimer && clearTimeout(this.changeTimer);
        this.changeTimer = null;

        if (this.props.onRgbChange) {
            this.changeTimer = setTimeout(dimmer => {
                this.changeTimer = null;
                this.props.onDimmerChange(dimmer);
                if (dimmer && this.props.useOn && !this.state.on) {
                    this.setState({ on: true });
                    this.props.onToggle(true);
                }
            }, 300, dimmer);
        }
    }

    onTemperatureChanged = value => {
        this.setState({ temperature: (((this.tMax - this.tMin) / 100) * value) + this.tMin });

        this.changeTimerTemperature = setTimeout(value => {
            this.changeTimerTemperature = null;
            this.props.onRgbChange(UtilsColors.rgb2string(UtilsColors.temperatureToRGB(this.state.temperature)), Math.round(this.state.temperature), SmartDialogColor.COLOR_MODES.TEMPERATURE);
        }, 300, value);
    }

    getOnOffButton() {
        if (!this.props.useOn) {
            return null;
        }
        return <CustomFab key="onoff-button"
            variant="round"
            color="primary"
            title={this.state.on ? I18n.t('Off') : I18n.t('On')}
            active={!this.state.on}
            onClick={this.onToggle}
            className={cls.buttonUseOn}
        >
            <IconLight />
        </CustomFab>;
    }

    getColorModeButton() {
        if (!this.props.modeTemperature || !this.props.modeRGB) return null;
        return <CustomFab key="color-mode-button"
            variant="round"
            color="primary"
            title={this.state.tempMode ? I18n.t('HUE') : I18n.t('Color temperature')}
            className={cls.buttonMode}
            onClick={this.onSwitchColorMode}
        >
            {this.state.tempMode ? <IconRGB /> : <IconTemp />}
        </CustomFab>;
    }

    onToggle = () => {
        this.onClick();
        this.props.onToggle && this.props.onToggle(!this.state.on);
        this.setState({ on: !this.state.on });
    }

    generateContent() {
        let pos =
            SmartDialogColor.colorToPos(this.state.color, this.refColorImage.current?.offsetWidth - HANDLER_SIZE);

        if (this.state.tempMode) {
            this.imageCT = ColorsTempImg;// this.imageCT || this.createCT(600);
        }
        return <div className={cls.wrapperModalContentColor}>
            <div className={cls.marginAuto}>
                <div className={cls.wrapperDiv}>
                    <div key="color-dialog"
                        ref={this.refColor}
                        className={clsx(cls.div, this.state.tempMode && cls.displayNone)}
                    >
                        <div
                            ref={this.refColorImage}
                            alt="color"
                            id='color'
                            onMouseDown={this.onMouseDown}
                            onTouchStart={this.onMouseDown}
                            className={clsx(cls.colorCircle, this.state.tempMode && cls.displayNone)}
                        >
                            <div className={clsx(cls.rotate, this.state.tempMode && cls.displayNone)}>
                                <div className={cls.colorBackground} />
                            </div>
                        </div>
                        <div ref={this.refColorCursor}
                            className={clsx(this.props.classes.cursor, cls.cursor, this.state.tempMode && cls.displayNone)}
                            style={{
                                background: this.state.color,
                                top: isNaN(pos.y) ? 0 : pos.y + (pos.y > 0 ? 0 : -HANDLER_SIZE),
                                left: isNaN(pos.x) ? `calc(50% - ${HANDLER_SIZE / 2}px)` : pos.x + (pos.x > 0 ? 0 : -HANDLER_SIZE),
                                opacity: 0.9
                            }}>
                        </div>
                    </div>
                    {this.state.tempMode && <div className={clsx(cls.div, cls.wrapperTemperature)}>
                        <div className={cls.wrapperSlider}>
                            <div className={cls.textSlider}>{I18n.t('Temperature')}</div>
                            <CustomSlider
                                hue={this.state.temperature}
                                value={100 * (this.state.temperature - this.tMin) / (this.tMax - this.tMin)}
                                onChange={this.onTemperatureChanged}
                                className={cls.width300}
                                orientation
                                temperature
                                tMin={this.tMin}
                                tMax={this.tMax}
                            />
                        </div>
                        <div className={cls.wrapperSlider}>
                            <div className={cls.textSlider}>{I18n.t('Brightness')}</div>
                            <CustomSlider
                                hue={this.getHue()}
                                value={this.state.dimmer}
                                onChange={this.onDimmerChanged}
                                className={cls.width300}
                                orientation
                            />
                        </div>
                    </div>}
                </div>
                {this.props.useDimmer && !this.state.tempMode && <div className={cls.dimmerSlider}>
                    <CustomSlider
                        hue={this.getHue()}
                        value={this.state.dimmer}
                        onChange={this.onDimmerChanged}
                        className={cls.width300}
                    />
                </div>}
            </div>
            {this.getOnOffButton()}
            {this.getColorModeButton()}
        </div>;
    }
}

export default withStyles(styles)(SmartDialogColor);
