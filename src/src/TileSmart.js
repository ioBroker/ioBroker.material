import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import Theme from './theme';
import Types from './States/Types';

import SmartLight from './States/SmartLight';
import SmartDimmer from './States/SmartDimmer';
import SmartGeneric from './States/SmartGeneric';

class Tile extends Component {
    static propTypes = {
        id:          PropTypes.string.isRequired,
        objects:     PropTypes.object.isRequired,
        states:      PropTypes.object.isRequired,
        enumName:    PropTypes.string,
        channelInfo: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.state = {
            state: false,
            isPointer: false
        };
        this.handlers = {
            onMouseDown: null,
            onMouseUp: null,
            onClick: null
        };
    }

    getObjectName(channelName) {
        return SmartGeneric.getObjectName(this.props.objects, this.props.id, null, channelName, this.props.enumName);
    }

    onMouseDown(e) {
        if (this.handlers.onMouseDown) this.handlers.onMouseDown(e);
    }

    onMouseUp(e) {
        if (this.handlers.onMouseUp) this.handlers.onMouseUp(e);
    }

    onClick(e) {
        if (this.handlers.onClick) this.handlers.onClick(e);
    }

    wrapContent(content) {
        //<Col xs={12} sm={6} md={4} lg={3}>
        return (<Row style={{cursor: this.state.isPointer ? 'pointer' : 'none'}}>
            <Paper style={Object.assign(Theme.tile.tile, this.state.state ? Theme.tile.tileOn : Theme.tile.tileOff)}
                   zDepth={1}
                   onMouseDown={this.onMouseDown.bind(this)}
                   onTouchStart={this.onMouseDown.bind(this)}
                   onMouseUp={this.onMouseUp.bind(this)}
                   onTouchEnd={this.onMouseUp.bind(this)}
                   onClick={this.onClick.bind(this)}>
                <span style={{display: 'none'}}>{this.props.id}</span>
                {content}
            </Paper>
        </Row>);
    }

    registerHandler(eventName, handler) {
        this.handlers[eventName] = handler;
    }

    createControl(control, channelInfo, tile) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={channelInfo.id}
            enumName={this.props.enumName}
            channelInfo={channelInfo}
            tile={tile}
            states={this.props.states}
            objects={this.props.objects}
            registerHandler={this.registerHandler.bind(this)}
            onCollectIds={(element, ids, isMount) => this.props.onCollectIds && this.props.onCollectIds(element, ids, isMount)}
            onControl={(id, val) => this.props.onControl && this.props.onControl(id, val)}
        />);
    }

    render() {
        if (this.channelInfo.type === Types.light) {
            return this.wrapContent(this.createControl(SmartLight, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.dimmer) {
            return this.wrapContent(this.createControl(SmartDimmer, this.channelInfo, this));
        } else {
            return null;
        }
    }
}

export default Tile;

