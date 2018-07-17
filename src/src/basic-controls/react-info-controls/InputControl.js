import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
// import Moment from 'react-moment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    line: {
        width: 'calc(100% - 6px)'
    },
    input: {
        width: 'calc(60% - 10px)'
    },
    button: {
        width: '40%',
        marginLeft: 10
    },
    icon: {
        height: 20,
        marginRight: 10
    }
});

class InputControl extends Component {
    static propTypes = {
        classes:    PropTypes.object.isRequired,
        label:      PropTypes.string.isRequired,
        value:      PropTypes.object.isRequired,
        icon:       PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        type:       PropTypes.string,
        onChange:   PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.type = this.props.type || (typeof this.props.value === 'number' ? 'number' : 'text');
        this.state = {
            val: this.props.value ? this.props.value.val : '?',
            ts: this.props.value ? this.props.value.ts : 0,
            lc: this.props.value ? this.props.value.lc : 0
        }
    }

    onChange(val) {
        this.setState({val});
    }

    onKeyDown(e) {
        if (e.keyCode === 13) {
            this.props.onChange(this.type === 'number' ? parseFloat(this.state.val) : this.state.val);
        }
    }

    render() {
        const {classes, label, icon, onChange} = this.props;
        let Icon;
        if (icon) {
            if (typeof icon === 'object') {
                Icon = icon;
                Icon = (<Icon className={classes.icon} />);
            } else {
                Icon = (<img alt={label} src={icon} className={classes.icon}/>);
            }
        }
        return (
            <div className={classes.line}>
                <TextField
                    tabIndex="0"
                    className={classes.input}
                    type={this.type}
                    label={label}
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.val}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onChange={event => this.onChange(event.target.value)}
                    margin="normal"
                />
                <Button
                    tabIndex="1"
                    className={classes.button}
                    onClick={e => onChange(this.type === 'number' ? parseFloat(this.state.val) : this.state.val)}
                    variant="contained">
                    {Icon}
                    {label}
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(InputControl);