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
import React from 'react'
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Slider from './Slider';

import UtilsColor from '../../UtilsColors';

const styles = {
    track: {
        background: 'rgba(0,0,0,0) !important',
    },
    trackBefore: {
        background: 'rgba(0,0,0,0) !important',
    },
    trackAfter: {
        background: 'rgba(0,0,0,0) !important',
    },
    thumb: {
        background: 'rgba(255,255,255,0.8)',
        borderRadius: 10,
        height: 20
    },
    div: {
        borderRadius: 15,
        paddingLeft: 5,
        paddingRight: 5,
        width: '100%',
        height: 30,
        paddingTop: 0.1,
        // boxShadow: 'rgba(255, 255, 255, 0.1) 0px 0.2em 0.1em 0.05em inset, rgba(0, 0, 0, 0.5) 0px -0.2em 0.1em 0.05em inset, rgba(0, 0, 0, 0.3) 0px 0.5em 0.65em 0px'
    }
};

class ColorSaturation extends React.Component {
    static propTypes = {
        hue:        PropTypes.number,
        saturation: PropTypes.number,
        onChange:   PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            hue: this.props.hue || 0, // 0 - 360
            saturation: this.props.saturation
        };
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed = false;
        if (props.hue !== state.hue) {
            newState.hue = props.hue;
            changed = true;
        }
        if (props.saturation !== state.saturation) {
            newState.saturation = props.saturation;
            changed = true;
        }

        return changed ? newState : null;
    }

    handleChange(event, value) {
        if (event) event.stopPropagation();
        this.props.onChange && this.props.onChange(value);
        this.setState({saturation: value});
    };

    render() {
        const rgb = this.state.hue === '#FFFFFF' ? '#FFFFFF' : UtilsColor.rgb2string(UtilsColor.hslToRgb(this.state.hue / 360, 1, 0.5));
        const rgba = UtilsColor.hexToRgbA(rgb, 1);
        const color = 'linear-gradient(to right, rgba(0,0,0,1) 0%,' + rgba + ' 100%)';
        return (
            <div className={this.props.classes.div} style={{background: color}}>
                <Slider
                    value={this.state.saturation}
                    aria-labelledby="label"
                    min={0}
                    max={100}
                    classes={{
                        track: this.props.classes.track,
                        trackBefore: this.props.classes.trackBefore,
                        trackAfter: this.props.classes.trackAfter,
                        thumb: this.props.classes.thumb
                    }}
                    onChange={this.handleChange.bind(this)} />
            </div>
        )
    }
}

export default withStyles(styles)(ColorSaturation);
