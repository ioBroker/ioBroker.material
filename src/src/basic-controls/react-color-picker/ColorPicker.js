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
import {ChromePicker} from 'react-color'
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import IconDelete from 'react-icons/lib/md/delete';

const styles = {
    color: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
    },
    delButton: {
        width: 32,
        height: 32
    },
    swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
        verticalAlign: 'middle'
    },
    popover: {
        position: 'absolute',
        zIndex: '2',
    },
    cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }
};

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
                return 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')';
            } else {
                return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
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
        return (
            <div style={this.props.style}>
                <TextField
                    id="name"
                    style={{width: 'calc(100% - 80px)'}}
                    label={this.props.name || 'color'}
                    value={color}
                    onChange={e => this.handleChange(e.target.value)}
                    margin="normal"
                />
                <IconButton onClick={() => this.handleChange('')} style={Object.assign({}, styles.delButton, color ? {} : {opacity: 0, cursor: 'default'})}><IconDelete/></IconButton>
                <div style={styles.swatch} onClick={() => this.handleClick()}>
                    <div style={Object.assign({}, styles.color, {background: color})} />
                </div>
                { this.state.displayColorPicker ? <div style={styles.popover}>
                    <div style={styles.cover} onClick={() => this.handleClose()}/>
                    <ChromePicker color={ this.state.color } onChangeComplete={color => this.handleChange(color)} />
                </div> : null }

            </div>
        )
    }
}

export default ColorPicker