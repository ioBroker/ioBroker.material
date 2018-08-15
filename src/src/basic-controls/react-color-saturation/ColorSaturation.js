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
import React from 'react'
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Slider from '@material-ui/lab/Slider';

import UtilsColor from '../../UtilsColors';

const styles = {
    track: {
        height: 20
    },
    trackBefore: {
        height: 20
    },
    trackAfter: {
        height: 20
    },
    thumb: {
        background: 'rgba(255,255,255,0.8)',
    }
};

class ColorSaturation extends React.Component {
    static propTypes = {
        hue:        PropTypes.string,
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
    componentWillReceiveProps(nextProps) {
        const newState = {};
        if (nextProps.hue !== this.state.hue) {
            newState.hue = nextProps.hue;
            this.setState({hue: nextProps.hue});
        }
    }

    handleChange(event, value) {
        event.stopPropagation();
        this.props.onChange && this.props.onChange(value);
        this.setState({saturation: value});
    };

    render() {
        const rgb = UtilsColor.rgb2string(UtilsColor.hslToRgb(this.state.hue / 360, 1, 0.5));
        const rgba = UtilsColor.hexToRgbA(rgb, 1);
        const color = 'linear-gradient(to right, rgba(0,0,0,1) 0%,' + rgba + ' 100%)';
        console.log(rgb + ' ' + rgba);
        return (
            <div style={{width: '100%', height: 30, background: color, paddingTop: 0.1}}>
                <Slider value={this.state.saturation} aria-labelledby="label" min={0} max={100}
                    //classes={{
                    //    track: this.props.classes.track,
                    //    trackBefore: this.props.classes.trackBefore,
                    //    trackAfter: this.props.classes.trackAfter,
                    //    thumb: this.props.classes.thumb
                    //}}
                    onChange={this.handleChange.bind(this)} />
            </div>
        )
    }
}
export default withStyles(styles)(ColorSaturation);