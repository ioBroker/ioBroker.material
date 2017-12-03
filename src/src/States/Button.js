import React from 'react';
import Generic from './Generic';
import RaisedButton from 'material-ui/RaisedButton';

class Button extends Generic {

    // override constructor
    constructor(props) {
        super(props, true)
    }

    onTouchTap() {
        // default handler
        this.props.onControl(this.props.id, true);
    }

    render() {
        return this.wrapContent(<RaisedButton label={this.getObjectName()} fullWidth={true} onTouchTap={() => this.onTouchTap()}/>);
    }
}

export default Button;

