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
import CircularProgress from '@material-ui/core/CircularProgress';

import Icon from 'react-icons/lib/ti/lightbulb'

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
            temperature:    null,
            dimmer:         null,
            on:             null,
            saturation:     null
        };

        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'RED');

            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
                ids.red = {id: state.id};
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
                    ids.rgb = {id: state.id};
                } else {
                    state = this.channelInfo.states.find(state => state.id && state.name === 'HUE');
                    if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                        ids.hue = {id: state.id};
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
            if (!state) {
                state = this.channelInfo.states.find(state => state.id && state.name === 'BRIGHTNESS');
            }
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
            }
        }
        this.ids = ids;

        this.key = 'smart-dimmer-' + this.id + '-';

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;
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
        return Math.round((val - props.min) / (props.max - props.min) * 100);
    }

    percentToRealValue(props, percent) {
        percent = parseFloat(percent);
        return Math.round((props.max - props.min) * percent / 100);
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

    setRgbValue(rgb) {
        const newValue = {};
        if (this.ids.rgb) {
            newValue[this.ids.rgb.id] = rgb;
            this.props.onControl(this.ids.rgb.id, rgb);
            this.ids.on && this.props.onControl(this.ids.on.id, true);
        } else if (this.ids.red) {
            let [r, g, b] = UtilsColors.hex2array(rgb);
            r = this.realValueToPercent({min: 0, max: 255}, r);
            g = this.realValueToPercent({min: 0, max: 255}, g);
            b = this.realValueToPercent({min: 0, max: 255}, b);
            newValue[this.ids.red.id] = r;
            newValue[this.ids.green.id] = g;
            newValue[this.ids.blue.id] = b;
            r = this.percentToRealValue(this.ids.red, r);
            g = this.percentToRealValue(this.ids.green, g);
            b = this.percentToRealValue(this.ids.blue, b);
            this.props.onControl(this.ids.red.id, r);
            this.props.onControl(this.ids.green.id, g);
            this.props.onControl(this.ids.blue.id, b);
            this.ids.on && this.props.onControl(this.ids.on.id, true);
        } else if (this.ids.hue) {
            let [r, g, b] = UtilsColors.hex2array(rgb);
            let [h, s, l] = UtilsColors.rgbToHsl(r, g, b);
            h = this.realValueToPercent({min: 0, max: 1}, h);
            s = this.realValueToPercent({min: 0, max: 1}, s);
            l = this.realValueToPercent({min: 0, max: 1}, l);
            newValue[this.ids.hue.id] = h;
            if (this.ids.saturation) {
                newValue[this.ids.saturation.id] = s;
            }
            if (this.ids.dimmer) {
                newValue[this.ids.dimmer.id] = l;
            }
            h = this.percentToRealValue(this.ids.hue, h);
            s = this.percentToRealValue(this.ids.saturation, s);
            l = this.percentToRealValue(this.ids.dimmer, l);
            this.props.onControl(this.ids.hue.id, h);
            this.ids.saturation && this.props.onControl(this.ids.saturation.id, s);
            this.ids.dimmer && this.props.onControl(this.ids.dimmer.id, l);
            this.ids.on && this.props.onControl(this.ids.on.id, true);
        }

        if (this.ids.on && !this.state[this.ids.on.id]) {
            newValue[this.ids.on.id] = true;
        }

        this.setState(newValue);

    }

    setValue(props, percent) {
        if (percent) {
            this.lastNotNullPercent = percent;
        } else {
            const p = this.realValueToPercent(props);
            if (p) {
                this.lastNotNullPercent = p;
            }
        }

        console.log('Control ' + props.id + ' = ' + this.percentToRealValue(props, percent));

        this.setState({setValue: percent});
        this.props.onControl(props.id, this.percentToRealValue(props, percent));
    }

    onToggleValue() {
        if (this.ids.on) {
            this.props.onControl(this.ids.on.id, !this.state[this.ids.on.id]);
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
                customIcon = (<Icon width={'100%'} height={'100%'}/>);
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
        if (this.ids.rgb) {
            color = states[this.ids.rgb.id];
        } else if (this.ids.red) {
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
        } else if (this.ids.hue) {
            let hue = states[this.ids.hue.id];
            let saturation = this.ids.saturation ? states[this.ids.saturation.id] : 100;
            let dimmer = this.ids.dimmer ? states[this.ids.dimmer.id] : 100;
            if (hue !== null      && saturation !== null      && dimmer !== null &&
                hue !== undefined && saturation !== undefined && dimmer !== undefined) {
                hue = this.percentToRealValue({min: 0, max: 1}, hue);
                saturation = this.percentToRealValue({min: 0, max: 1}, saturation);
                dimmer = this.percentToRealValue({min: 0, max: 1}, dimmer);
                color = UtilsColors.rgb2string(UtilsColors.hslToRgb(hue, saturation, dimmer));
            }
        } else if (this.ids.temperature) {
            let temperature = states[this.ids.temperature.id];
            temperature = this.percentToRealValue(this.ids.temperature, temperature);
            color = UtilsColors.rgb2string(UtilsColors.temperatureToRGB(temperature));
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
        return this.wrapContent([
            this.getStandardContent(this.id, true),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                    windowWidth={this.props.windowWidth}
                    ids={this.ids}
                    startRGB={this.getColor() || '#000000'}
                    startOn={this.ids.on && this.state[this.ids.on.id]}
                    onRgbChange={this.setRgbValue.bind(this)}
                    onValueChange={this.setValue.bind(this)}
                    onToggle={this.ids.on && this.onToggleValue.bind(this)}
                    onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default SmartColor;

