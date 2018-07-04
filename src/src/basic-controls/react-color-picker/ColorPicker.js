import React from 'react'
import {ChromePicker} from 'react-color'
import TextField from '@material-ui/core/TextField';

const styles = {
    color: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
    },
    swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
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
        this.setState({color: color.rgb});
        this.props.onChange && this.props.onChange(ColorPicker.getColor(color));
    };

    render() {
        const color = ColorPicker.getColor(this.state.color);
        return (
            <div style={this.props.style}>
                <TextField
                    id="name"
                    style={{width: 'calc(100% - 48px)'}}
                    label={this.props.name || 'color'}
                    value={color}
                    onChange={e => this.handleChange(e.target.value)}
                    margin="normal"
                />
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