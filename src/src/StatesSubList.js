import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from './Utils';
import Theme from './theme';
import I18n from './i18n';
import Tile from "./Tile";
import TileSmart from "./TileSmart";
import ChannelDetector from "./Channels/Detector";

class StatesSubList extends Component {

    static propTypes = {
        enumID:   PropTypes.string.isRequired,
        objects:  PropTypes.object.isRequired,
        editMode: PropTypes.bool.isRequired,
        states:   PropTypes.object.isRequired,
        keys:     PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.detector = new ChannelDetector();
        const state = {};
        this.props.items.forEach(id => state[id] = true);
        this.state = state;
    }

    isVisible() {
        for (const id in this.state) {
            if (this.state.hasOwnProperty(id) && this.state[id]) {
                return true;
            }
        }
        return false;
    }

    onVisibilityControl(id, visible) {
        const newState = {};
        newState[id] = visible;
        this.setState(newState);
    }

    createControl(control, channelId, channelInfo) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={channelId}
            id={channelId}
            enumName={Utils.getObjectName(this.props.objects, this.props.enumID)}
            enumFunctions={this.props.enumFunctions}
            editMode={this.props.editMode}
            channelInfo={channelInfo}
            states={this.props.states}
            objects={this.props.objects}
            onVisibilityControl={this.onVisibilityControl.bind(this)}
            onSaveSettings={this.props.onSaveSettings}
            onCollectIds={this.props.onCollectIds}
            onControl={this.props.onControl}
        />);
    }

    getListItems(items) {
        const that = this;
        const usedIds = [];
        return items.map(id => {
            let detected = that.detector.detect(that.props.objects, that.props.keys, id, usedIds);
            if (detected) {
                return that.createControl(TileSmart, id, detected);
            } else {
                let channelInfo = Tile.getChannelInfo(that.props.objects, id);
                if (!channelInfo || (channelInfo.main === undefined && (!channelInfo.states || !channelInfo.states.length))) {
                    return null;
                } else {
                    return this.createControl(Tile, id, channelInfo)
                }
            }
        });
    }

    render() {
        if (this.props.items && this.props.items.length && this.isVisible()) {
            console.log('Add to ' + (this.props.enumID || 'others') + ': ' + this.props.items.join(', '));
            return (<div key={(this.props.enumID || 'others').replace(/[^\w\d]/g, '_') + '-title'} style={Theme.list.row}><h3
                style={Theme.list.title}>{
                    this.props.enumID ? Utils.getObjectName(this.props.objects, this.props.enumID) : I18n._('Others')
                }</h3>
                <div style={{width: '100%'}}>{this.getListItems(this.props.items)}</div>
            </div>);
        } else {
            return null;
        }
    }
}

export default StatesSubList;