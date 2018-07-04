import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import I18n from './i18n';
import Theme from './theme';
import Types from './States/SmartTypes';

import SmartBlinds from './States/SmartBlinds';
import SmartButton from './States/SmartButton';
import SmartDimmer from './States/SmartDimmer';
import SmartGeneric from './States/SmartGeneric';
import SmartInfo from './States/SmartInfo';
import SmartSlider from './States/SmartSlider';
import SmartState from './States/SmartState';
import SmartSwitch from './States/SmartSwitch';
import SmartThermometer from './States/SmartThermometer';
import SmartThermostat from "./States/SmartThermostat";
import SmartWindowTilt from './States/SmartWindowTilt';

class TileSmart extends Component {
    static propTypes = {
        id:          PropTypes.string.isRequired,
        user:        PropTypes.string.isRequired,
        objects:     PropTypes.object.isRequired,
        states:      PropTypes.object.isRequired,
        editMode:    PropTypes.bool.isRequired,
        enumNames:   PropTypes.array,
        channelInfo: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.state = {
            state: false,
            isPointer: false,
            visible: null,
            colorOn: Theme.tile.tileOn.background,
            colorOff: Theme.tile.tileOff.background
        };
        this.stateId = this.channelInfo && this.channelInfo.states.find(state => state.id).id;
        this.handlers = {
            onMouseDown: null,
            onMouseUp: null,
            onClick: null
        };
    }

    getObjectName(channelName) {
        return SmartGeneric.getObjectName(this.props.objects, this.stateId, null, channelName, this.props.enumNames);
    }

    onMouseDown(e) {
        if (this.handlers.onMouseDown && !this.props.editMode) {
            //e.preventDefault();
            e.stopPropagation();
            this.handlers.onMouseDown(e);
        }
    }

    onMouseUp(e) {
        if (this.handlers.onMouseUp && !this.props.editMode) this.handlers.onMouseUp(e);
    }

    onClick(e) {
        if (this.handlers.onClick && !this.props.editMode) {
            this.handlers.onClick(e);
        }
    }

    getTileStyle() {
        let style;
        if (this.props.editMode) {
            style = Object.assign({}, Theme.tile.tile, Theme.tile.tileOn, {background: this.state.colorOn}, Theme.tile.editEnabled);
            Object.assign(style, Theme.tile.editEnabled);
        } else {
            style = this.state.state ? Object.assign({}, Theme.tile.tile, Theme.tile.tileOn, {background: this.state.colorOn}) :
                Object.assign({}, Theme.tile.tile, Theme.tile.tileOff, {background: this.state.colorOff});
        }
        return style;
    }

    setVisibility(isVisible) {
        if (this.state.visible !== isVisible) {
            this.setState({visible: isVisible});
            this.props.onVisibilityControl(this.stateId, isVisible);
        }
    }

    setColorOn(color) {
        if (this.state.colorOn !== color) {
            this.setState({colorOn: color});
        }
    }

    setColorOff(color) {
        if (this.state.colorOff !== color) {
            this.setState({colorOff: color});
        }
    }

    wrapContent(content) {
        let style = {cursor: this.state.isPointer ? 'pointer' : 'inherit'};
        if (!this.props.editMode && !this.state.visible && this.channelInfo) {
            style.display = 'none';
        }

        return (
            <Paper style={Object.assign(this.getTileStyle(), style)}
                   onMouseDown={this.onMouseDown.bind(this)}
                   onTouchStart={this.onMouseDown.bind(this)}
                   onMouseUp={this.onMouseUp.bind(this)}
                   onTouchEnd={this.onMouseUp.bind(this)}
                   onClick={this.onClick.bind(this)}>
                <span style={{display: 'none'}}>{this.channelInfo ? this.channelInfo.states.find(state => state.id).id : 'nothing'}</span>
                {content}
            </Paper>
        );
    }

    registerHandler(eventName, handler) {
        if (!this.props.editMode) {
            this.handlers[eventName] = handler;
        }
    }

    createControl(control, channelInfo, tile) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={channelInfo.id + '-tile-' + Component.name}
            enumNames={this.props.enumNames}
            channelInfo={channelInfo}
            tile={tile}
            editMode={this.props.editMode}
            states={this.props.states}
            objects={this.props.objects}
            registerHandler={this.registerHandler.bind(this)}
            onSaveSettings={this.props.onSaveSettings}
            onCollectIds={this.props.onCollectIds}
            onControl={this.props.onControl}
        />);
    }

    render() {
        let Control;

        if (this.channelInfo) {
            switch (this.channelInfo.type) {
                case Types.light:
                case Types.socket:
                    Control = SmartSwitch;
                    break;
                case Types.dimmer:
                    Control = SmartDimmer;
                    break;
                case Types.blind:
                    Control = SmartBlinds;
                    break;
                case Types.windowTilt:
                    Control = SmartWindowTilt;
                    break;
                case Types.button:
                    Control = SmartButton;
                    break;
                case Types.temperature:
                    Control = SmartThermometer;
                    break;
                case Types.info:
                    Control = SmartInfo;
                    break;
                case Types.thermostat:
                    Control = SmartThermostat;
                    break;
                case Types.value:
                    Control = SmartSlider;
                    break;
                case Types.window:
                case Types.fireAlarm:
                case Types.door:
                case Types.motion:
                    Control = SmartState;
                    break;
                default:
                    break;
            }
        } else {
            return this.wrapContent((<span>{I18n.t('Nothing here')}</span>));
        }

        if (!Control) {
            let name = this.channelInfo.type;
            Object.keys(Types).forEach(e => {
                if (Types[e] === this.channelInfo.type) {
                    name = e;
                    return false;
                }
            });
            console.error(`${name} not implemented!`);
            return null;
        } else {
            return this.wrapContent(this.createControl(Control, this.channelInfo, this));
        }
    }
}

export default TileSmart;

