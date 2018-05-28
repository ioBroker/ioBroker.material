import React from 'react';
import Generic from './Generic';
import RaisedButton from '@material-ui/core/Button';

class Button extends Generic {

    // override constructor
    constructor(props) {
        super(props, true)
    }

    onClick() {
        // default handler
        this.props.onControl(this.props.id, true);
    }

    render() {
        return this.wrapContent(<RaisedButton label={this.getObjectName()} fullWidth={true} onClick={() => this.onClick()}/>);
    }
}

export default Button;

