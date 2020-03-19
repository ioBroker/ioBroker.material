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
import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { TinyColor } from '@ctrl/tinycolor';

import {TiLightbulb as Icon} from 'react-icons/ti'

import SmartGeneric from './SmartGeneric';
import Theme from '../theme';
import Dialog from '../Dialogs/SmartDialogColor';
import I18n from '../i18n';
import UtilsColors from '../UtilsColors';

class SmartColor extends SmartGeneric {

    constructor(props) {
        super(props);
        const ids = {
            red:            null,
            green:          null,
            blue:           null,

            rgb:            null,

            hue:            null,
            saturation:     null,
            brightness:     null,

            temperature:    null,
            dimmer:         null,
            on:             null
        };
        let colorMode;
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'RED');

            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
                ids.red = {id: state.id};
                colorMode = Dialog.COLOR_MODES.R_G_B;
                if (this.props.objects[state.id].common.min !== undefined) {
                    ids.red.min = parseFloat(this.props.objects[state.id].common.min);
                } else {
                    ids.red.min = 0;
                }
                if (this.props.objects[state.id].common.max !== undefined) {
                    ids.red.max = parseFloat(this.props.objects[state.id].common.max);
                } else {
                    ids.red.max = 255;
                }

                state = this.channelInfo.states.find(state => state.id && state.name === 'GREEN');
                if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                    ids.green = {id: state.id};
                    if (this.props.objects[state.id].common.min !== undefined) {
                        ids.green.min = parseFloat(this.props.objects[state.id].common.min);
                    } else {
                        ids.green.min = 0;
                    }
                    if (this.props.objects[state.id].common.max !== undefined) {
                        ids.green.max = parseFloat(this.props.objects[state.id].common.max);
                    } else {
                        ids.green.max = 255;
                    }
                }

                state = this.channelInfo.states.find(state => state.id && state.name === 'BLUE');
                if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                    ids.blue = {id: state.id};
                    if (this.props.objects[state.id].common.min !== undefined) {
                        ids.blue.min = parseFloat(this.props.objects[state.id].common.min);
                    } else {
                        ids.blue.min = 0;
                    }
                    if (this.props.objects[state.id].common.max !== undefined) {
                        ids.blue.max = parseFloat(this.props.objects[state.id].common.max);
                    } else {
                        ids.blue.max = 255;
                    }
                }
            } else {
                state = this.channelInfo.states.find(state => state.id && state.name === 'RGB');
                if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                    colorMode = Dialog.COLOR_MODES.RGB;
                    ids.rgb = {id: state.id};
                    this.id = this.id || state.id;
                } else {
                    state = this.channelInfo.states.find(state => state.id && state.name === 'HUE');
                    if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                        colorMode = Dialog.COLOR_MODES.HUE;
                        ids.hue = {id: state.id};
                        this.id = this.id || state.id;
                        if (this.props.objects[state.id].common.min !== undefined) {
                            ids.hue.min = parseFloat(this.props.objects[state.id].common.min);
                        } else {
                            ids.hue.min = 0;
                        }
                        if (this.props.objects[state.id].common.max !== undefined) {
                            ids.hue.max = parseFloat(this.props.objects[state.id].common.max);
                        } else {
                            ids.hue.max = 360;
                        }
                        if (this.props.objects[state.id].common.unit !== undefined) {
                            ids.hue.unit = this.props.objects[state.id].common.unit;
                        } else {
                            ids.hue.unit = '';
                        }
                    }
                }
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'TEMPERATURE');
            ids.temperature = state && state.id ? {id: state.id} : null;
            if (ids.temperature) {
                this.id = this.id || state.id;
                colorMode = colorMode || Dialog.COLOR_MODES.TEMPERATURE;
                if (this.props.objects[state.id].common.min !== undefined) {
                    ids.temperature.min = parseFloat(this.props.objects[state.id].common.min);
                } else {
                    ids.temperature.min = 2200;
                }
                if (this.props.objects[state.id].common.max !== undefined) {
                    ids.temperature.max = parseFloat(this.props.objects[state.id].common.max);
                } else {
                    ids.temperature.max = 6500;
                }
                if (this.props.objects[state.id].common.unit !== undefined) {
                    ids.temperature.unit = this.props.objects[state.id].common.unit;
                } else {
                    ids.temperature.unit = '';
                }
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'DIMMER');
            ids.dimmer = state && state.id ? {id: state.id} : null;
            if (ids.dimmer) {
                if (this.props.objects[state.id].common.min !== undefined) {
                    ids.dimmer.min = parseFloat(this.props.objects[state.id].common.min);
                } else {
                    ids.dimmer.min = 0;
                }
                if (this.props.objects[state.id].common.max !== undefined) {
                    ids.dimmer.max = parseFloat(this.props.objects[state.id].common.max);
                } else {
                    ids.dimmer.max = 100;
                }
                if (this.props.objects[state.id].common.unit !== undefined) {
                    ids.dimmer.unit = this.props.objects[state.id].common.unit;
                } else {
                    ids.dimmer.unit = '%';
                }
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'BRIGHTNESS');
            ids.brightness = state && state.id ? {id: state.id} : null;
            if (ids.brightness) {
                if (this.props.objects[state.id].common.min !== undefined) {
                    ids.brightness.min = parseFloat(this.props.objects[state.id].common.min);
                } else {
                    ids.brightness.min = 0;
                }
                if (this.props.objects[state.id].common.max !== undefined) {
                    ids.brightness.max = parseFloat(this.props.objects[state.id].common.max);
                } else {
                    ids.brightness.max = 100;
                }
                if (this.props.objects[state.id].common.unit !== undefined) {
                    ids.brightness.unit = this.props.objects[state.id].common.unit;
                } else {
                    ids.brightness.unit = '%';
                }
            }


            state = this.channelInfo.states.find(state => state.id && state.name === 'SATURATION');
            ids.saturation = state && state.id ? {id: state.id} : null;
            if (ids.saturation) {
                if (this.props.objects[state.id].common.min !== undefined) {
                    ids.saturation.min = parseFloat(this.props.objects[state.id].common.min);
                } else {
                    ids.saturation.min = 0;
                }
                if (this.props.objects[state.id].common.max !== undefined) {
                    ids.saturation.max = parseFloat(this.props.objects[state.id].common.max);
                } else {
                    ids.saturation.max = 100;
                }
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'ON_LIGHT');
            if (!state) {
                state = this.channelInfo.states.find(state => state.id && state.name === 'ON');
            }

            ids.on = state && state.id ? {id: state.id} : null;
            if (ids.on) {
                this.props.tile.setState({isPointer: true});
                this.props.tile.registerHandler('onClick', this.onToggle.bind(this));
            }
        }
        this.ids = ids;

        this.key = 'smart-dimmer-' + this.id + '-';

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;
        this.stateRx.colorMode = colorMode;

        this.doubleState = true; // used in generic

        this.componentReady();
    }

    realValueToPercent(props, val) {
        if (val === undefined) {
            if (this.states[props.id]) {
                val = this.states[props.id].val || 0;
            } else {
                val = 0;
            }
        }
        val = parseFloat(val);
        return (val - props.min) / (props.max - props.min) * 100;
    }

    percentToRealValue(props, percent) {
        percent = parseFloat(percent);
        if (props) {
            let real = (props.max - props.min) * percent / 100 + props.min;
            if (props.max - props.min > 50) {
                real = Math.round(real);
            }
            return real;
        } else {
            return percent;
        }
    }

    updateBackgroundColor(states) {
        states = states || this.state;
        const color = this.getColor(states);
        if (color !== undefined) {
            this.props.tile.setColorOn(color);
            this.props.tile.setColorOff(UtilsColors.hexToRgbA(color, 0.5));
        } else {
            this.props.tile.setColorOn(Theme.tile.tileOn.background);
            this.props.tile.setColorOff(Theme.tile.tileOff.background);
        }
    }

    updateState(id, state) {
        let newState = {};
        let props;
        if (!state) {
            return;
        }

        if (this.ids.red && this.ids.red.id === id) {
            props = this.ids.red;
        } else if (this.ids.green && this.ids.green.id === id) {
            props = this.ids.green;
        } else if (this.ids.blue && this.ids.blue.id === id) {
            props = this.ids.blue;
        } else if (this.ids.hue && this.ids.hue.id === id) {
            props = this.ids.hue;
        } else if (this.ids.temperature && this.ids.temperature.id === id) {
            props = this.ids.temperature;
        } else if (this.ids.saturation && this.ids.saturation.id === id) {
            props = this.ids.saturation;
        } else if (this.ids.dimmer && this.ids.dimmer.id === id) {
            props = this.ids.dimmer;
        }

        if (props) {
            const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
            if (!isNaN(val)) {
                newState[id] = this.realValueToPercent(props, val);
                this.setState(newState);
            } else {
                newState[id] = null;
                this.setState(newState);
            }
            this.updateBackgroundColor(Object.assign({}, this.state, newState));
        } else if (this.ids.on && this.ids.on.id === id) {
            let val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON' || state.val === 'ein' || state.val === 'EIN';
            newState[id] = val;

            this.setState(newState);

            this.props.tile.setState({state: val});
        } else
        if (this.ids.rgb && this.ids.rgb.id === id) {
            newState[id] = state.val;
            this.setState(newState);
            this.updateBackgroundColor(Object.assign({}, this.state, newState));
        } else {
            super.updateState(id, state);
        }
    }

    onRgbChange(rgb, temperature, colorMode) {
        const newValue = {};
        if (colorMode !== undefined) {
            newValue.colorMode = colorMode;
        }

        if (temperature && this.ids.temperature) {
            newValue[this.ids.temperature.id] = this.realValueToPercent(this.ids.temperature, temperature);
            this.props.onControl(this.ids.temperature.id, this.percentToRealValue(this.ids.temperature, newValue[this.ids.temperature.id]));
        } else
        if (this.ids.rgb) {
            newValue[this.ids.rgb.id] = rgb;
            this.props.onControl(this.ids.rgb.id, rgb);
        } else
        if (this.ids.red) {
            let [r, g, b] = UtilsColors.hex2array(rgb);

            r = this.realValueToPercent({min: 0, max: 255}, r);
            g = this.realValueToPercent({min: 0, max: 255}, g);
            b = this.realValueToPercent({min: 0, max: 255}, b);

            newValue[this.ids.red.id]   = r;
            newValue[this.ids.green.id] = g;
            newValue[this.ids.blue.id]  = b;

            r = this.percentToRealValue(this.ids.red, r);
            g = this.percentToRealValue(this.ids.green, g);
            b = this.percentToRealValue(this.ids.blue, b);

            this.props.onControl(this.ids.red.id, r);
            this.props.onControl(this.ids.green.id, g);
            this.props.onControl(this.ids.blue.id, b);
        } else
        if (this.ids.hue) {
            let [r, g, b] = UtilsColors.hex2array(rgb);
            let [h, s, l] = UtilsColors.rgbToHsl(r, g, b);
            h = this.realValueToPercent({min: 0, max: 1}, h);
            s = this.realValueToPercent({min: 0, max: 1}, s);
            l = this.realValueToPercent({min: 0, max: 1}, l);
            newValue[this.ids.hue.id] = h;
            if (this.ids.saturation) {
                newValue[this.ids.saturation.id] = s;
            }
            if (this.ids.brightness) {
                newValue[this.ids.brightness.id] = l;
            }
            h = this.percentToRealValue(this.ids.hue, h);
            s = this.percentToRealValue(this.ids.saturation, s);
            l = this.percentToRealValue(this.ids.brightness, l);

            this.props.onControl(this.ids.hue.id, h);
            this.ids.saturation && this.props.onControl(this.ids.saturation.id, s);
            this.ids.brightness && this.props.onControl(this.ids.brightness.id, l);
        } else
        if (this.ids.temperature) {
            newValue[this.ids.rgb.id] = rgb;
            const _rgb = UtilsColors.hex2array(rgb);
            this.props.onControl(this.ids.temperature.id, UtilsColors.rgb2temperature(_rgb[0], _rgb[1], _rgb[2]));
        }

        if (this.ids.on && !this.state[this.ids.on.id]) {
            newValue[this.ids.on.id] = true;
            this.props.onControl(this.ids.on.id, true);
        }
        if (this.ids.dimmer) {
            if (this.state[this.ids.dimmer.id] === 0) {
                newValue[this.ids.dimmer.id] = 100;
                this.props.onControl(this.ids.dimmer.id, 100);
            } else {
                this.props.onControl(this.ids.dimmer.id, this.state[this.ids.dimmer.id]);
            }
        }

        this.setState(newValue);

    }

    onDimmerChange(dimmer) {
        this.setState({dimmer});
        this.props.onControl(this.ids.dimmer.id, this.percentToRealValue(this.ids.dimmer, dimmer));
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        settings.unshift({
            name: 'colorMode',
            value: this.state.settings.colorMode || 'RGB/Kelvin',
            options: [
                {value: 'RGB/Kelvin',   label: I18n.t('RGB/Kelvin')},
                {value: 'RGB',          label: I18n.t('RGB')},
                {value: 'Kelvin',       label: I18n.t('Kelvin')}
                ],
            type: 'select'
        });

        return settings;
    }

    onToggle(value) {
        if (this.ids.on) {
            const newValue = value === undefined || typeof value === 'object' ? !this.state[this.ids.on.id] : value;
            this.setState({[this.ids.on.id]: newValue});
            this.props.onControl(this.ids.on.id, newValue);
        }
    }

    getIcon() {
        let customIcon;
        if (this.state.settings.useDefaultIcon) {
            customIcon = (<img src={this.getDefaultIcon()} alt="icon" style={{height: '100%'}}/>);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<img src={this.state.settings.icon} alt="icon" style={{height: '100%'}}/>);
            } else {
                customIcon = (<Icon width={Theme.tile.tileIconSvg.size} height={Theme.tile.tileIconSvg.size} style={{height: Theme.tile.tileIconSvg.size, width: Theme.tile.tileIconSvg.size}}/>);
            }
        }
        return (
            <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : {})} className="tile-icon">
                {customIcon}
                {this.state.executing ? <CircularProgress style={{position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
            </div>
        );
    }

    getColor(states) {
        states = states || this.state;

        let color;
        if (this.ids.rgb && this.state.colorMode === Dialog.COLOR_MODES.RGB) {
            color = states[this.ids.rgb.id];
        } else
        if (this.ids.red && this.state.colorMode === Dialog.COLOR_MODES.R_G_B) {
            let r = states[this.ids.red.id];
            let g = states[this.ids.green.id];
            let b = states[this.ids.blue.id];
            if (r !== null      && g !== null      && b !== null &&
                r !== undefined && g !== undefined && b !== undefined) {
                r = this.percentToRealValue({min: 0, max: 255}, r);
                g = this.percentToRealValue({min: 0, max: 255}, g);
                b = this.percentToRealValue({min: 0, max: 255}, b);
                color = UtilsColors.rgb2string([r, g, b]);
            }
        } else
        if (this.ids.hue && this.state.colorMode === Dialog.COLOR_MODES.HUE) {
            let hue = states[this.ids.hue.id];
            let saturation = this.ids.saturation ? states[this.ids.saturation.id] : 100;
            let brightness = this.ids.brightness ? states[this.ids.brightness.id] : 50;
            if (hue !== null      && saturation !== null      && brightness !== null &&
                hue !== undefined && saturation !== undefined && brightness !== undefined) {
                hue = this.percentToRealValue({min: 0, max: 1}, hue);
                saturation = this.percentToRealValue({min: 0, max: 1}, saturation);
                brightness = this.percentToRealValue({min: 0, max: 1}, brightness);
                color = UtilsColors.rgb2string(UtilsColors.hslToRgb(hue, saturation, brightness));
            }
        } else
        if (this.ids.temperature && this.state.colorMode === Dialog.COLOR_MODES.TEMPERATURE) {
            let temperature = this.percentToRealValue(this.ids.temperature, states[this.ids.temperature.id]);
            color = UtilsColors.rgb2string(UtilsColors.temperatureToRGB(temperature));
            if (this.state.dimmer !== undefined) {
                color = new TinyColor(color).darken(100 - this.state.dimmer).toString();
            }
        } else
        if (this.ids.rgb) {
            color = states[this.ids.rgb.id];
        } else
        if (this.ids.red) {
            let r = states[this.ids.red.id];
            let g = states[this.ids.green.id];
            let b = states[this.ids.blue.id];
            if (r !== null      && g !== null      && b !== null &&
                r !== undefined && g !== undefined && b !== undefined) {
                r = this.percentToRealValue({min: 0, max: 255}, r);
                g = this.percentToRealValue({min: 0, max: 255}, g);
                b = this.percentToRealValue({min: 0, max: 255}, b);
                color = UtilsColors.rgb2string([r, g, b]);
            }
        } else
        if (this.ids.hue) {
            let hue = states[this.ids.hue.id];
            let saturation = this.ids.saturation ? states[this.ids.saturation.id] : 100;
            let brightness = this.ids.brightness ? states[this.ids.brightness.id] : 50;
            if (hue !== null      && saturation !== null      && brightness !== null &&
                hue !== undefined && saturation !== undefined && brightness !== undefined) {
                hue = this.percentToRealValue({min: 0, max: 1}, hue);
                saturation = this.percentToRealValue({min: 0, max: 1}, saturation);
                brightness = this.percentToRealValue({min: 0, max: 1}, brightness);
                color = UtilsColors.rgb2string(UtilsColors.hslToRgb(hue, saturation, brightness));
            }
        } else if (this.ids.temperature) {
            let temperature = states[this.ids.temperature.id];
            temperature = this.percentToRealValue(this.ids.temperature, temperature);
            color = UtilsColors.rgb2string(UtilsColors.temperatureToRGB(temperature));
            color = new TinyColor(color).darken(100 - this.state.dimmer).toString();
        }

        if (color && color[0] !== '#' && color.match(/^rgb/)) {
            color = '#' + color;
        }

        return color;
    }

    getStateText() {
        if (this.ids.on) {
            if (this.ids.dimmer) {
                return this.state[this.ids.dimmer.id] + this.ids.dimmer.unit;
            } else {
                return this.state[this.ids.on.id] ? I18n.t('On') : I18n.t('Off');
            }
        } else if (this.ids.dimmer) {
            return this.state[this.ids.dimmer.id] + this.ids.dimmer.unit;
        }
    }

    render() {
        if (this.state.showDialog) {
            this.props.tile.unregisterHandler('onClick');
        } else {
            this.props.tile.registerHandler('onClick', this.onToggle.bind(this));
        }

        let modeRGB = !this.ids.temperature || !!(this.ids.rgb || this.ids.red || this.ids.hue);
        let modeTemperature = !!this.ids.temperature;
        if (this.state.settings.colorMode === 'RGB') {
            modeRGB = true;
            modeTemperature = false;
        } else
        if (this.state.settings.colorMode === 'Kelvin') {
            modeRGB = false;
            modeTemperature = true;
        }
        const color = this.getColor() || '#000000';

        return this.wrapContent([
            this.getStandardContent(this.id, true),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                    windowWidth={this.props.windowWidth}
                    ids={this.ids}

                    modeRGB={modeRGB}
                    modeTemperature={modeTemperature}

                    startModeTemp={this.state.colorMode === Dialog.COLOR_MODES.TEMPERATURE}
                    temperatureMin={(this.ids.temperature && this.ids.temperature.min) || 2200}
                    temperatureMax={(this.ids.temperature && this.ids.temperature.max) || 6500}

                    startRGB={color}
                    onRgbChange={this.onRgbChange.bind(this)}
                    startTemp={(this.ids.temperature && this.state[this.ids.temperature.id]) ? this.percentToRealValue(this.ids.temperature, this.state[this.ids.temperature.id]) : UtilsColors.rgb2temperature(color)}

                    startOn={this.ids.on && this.state[this.ids.on.id]}
                    useOn={!!this.ids.on}
                    onToggle={this.ids.on && this.onToggle.bind(this)}

                    startDimmer={this.ids.dimmer && this.state[this.ids.dimmer.id]}
                    useDimmer={!!this.ids.dimmer}
                    onDimmerChange={this.onDimmerChange.bind(this)}

                    onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default SmartColor;

