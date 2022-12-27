/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
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
import { withStyles } from '@mui/styles';
import { ChromePicker } from 'react-color'

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';

import { MdDelete as IconDelete } from 'react-icons/md';

const styles = theme => ({
    color: {
        width: 36,
        height: 14,
        borderRadius: 2,
    },
    swatch: {
        padding: 5,
        background: '#fff',
        borderRadius: 1,
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
        verticalAlign: 'middle'
    }
});

class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: this.props.color,
        };
    }

    handleClick = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker});
    };

    handleClose = () => {
        this.setState({displayColorPicker: false});
    };

    static getColor(color) {
        if (color && typeof color === 'object') {
            if (color.rgb) {
                return `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
            } else {
                return `rgba(${color.r},${color.g},${color.b},${color.a})`;
            }
        } else {
            return color || '';
        }
    }

    handleChange = (color) => {
        this.setState({color});
        this.props.onChange && this.props.onChange(ColorPicker.getColor(color));
    };

    render() {
        const color = ColorPicker.getColor(this.state.color);
        return <div style={this.props.style}>
            <TextField
                variant="standard"
                id="name"
                style={{width: 'calc(100% - 80px)'}}
                label={this.props.name || 'color'}
                value={color}
                onChange={e => this.handleChange(e.target.value)}
                margin="normal"
            />
            <IconButton
                size="small"
                onClick={() => this.handleChange('')}
                style={color ? {} : {opacity: 0, cursor: 'default'}}>
                <IconDelete/>
            </IconButton>
            <div className={this.props.classes.swatch}
                 onClick={() => this.handleClick()}>
                <div className={this.props.classes.color} style={{background: color}}/>
            </div>
            <Dialog onClose={() => this.handleClose()} open={this.state.displayColorPicker}>
                <ChromePicker color={ this.state.color } onChangeComplete={color => this.handleChange(color)} />
            </Dialog>
        </div>;
    }
}

export default withStyles(styles)(ColorPicker);
