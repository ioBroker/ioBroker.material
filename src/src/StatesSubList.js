import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from './Utils';
import Theme from './theme';
import I18n from './i18n';
import Tile from './Tile';
import TileSmart from './TileSmart';
import SmartDetector from './States/SmartDetector';

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
        this.detector = new SmartDetector();
        const state = {};
        this.props.items.forEach(id => state[id] = true);
        this.state = state;
    }

    isVisible() {
        for (const id in this.state) {
            if (this.props.editMode || (this.state.hasOwnProperty(id) && this.state[id])) {
                return true;
            }
        }
        return false;
    }

    onVisibilityControl(id, visible) {
        const newState = {};
        if (this.state[id] !== visible) {
            newState[id] = visible;
            this.setState(newState);
        }
        // console.log(`Set ${id} to ${visible} and ${this.props.enumID} => ${this.isVisible()}`);
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
            if (that.state[id] === undefined) {
                debugger;
            }

            if (!that.props.editMode && that.state[id] === false) {
//                console.log('Tile ' + id + ' is invisible');
//                const ids = Object.keys(that.state).map(id => `${id} => ${that.state[id]}`);
//                console.log(ids.join('; '));
                return null;
            }
            let detected;
            let someDetected = false;
            let controls = [];
            while((detected = that.detector.detect(that.props.objects, that.props.keys, id, usedIds))) {
                someDetected = true;
                controls.push(that.createControl(TileSmart, id, detected));
            }
            if (!someDetected) {
                let channelInfo = Tile.getChannelInfo(that.props.objects, id);
                if (!channelInfo || (channelInfo.main === undefined && (!channelInfo.states || !channelInfo.states.length))) {
                    //console.log('Nothing found for ' + id);
                } else {
                    controls.push(that.createControl(Tile, id, channelInfo));
                }
            }
            if (!controls.length) {
                return null;
            } else if (controls.length === 1) {
                return controls[0];
            } else {
                return controls;
            }
        });
    }

    render() {
        if (this.props.items && this.props.items.length && (this.isVisible() || this.props.editMode)) {
            //console.log('Add to ' + (this.props.enumID || 'others') + ': ' + this.props.items.join(', '));

            let items = this.getListItems(this.props.items);
            items = items.filter(e => e);
            if (items.length) {
                return (<div key={(this.props.enumID || 'others').replace(/[^\w\d]/g, '_') + '-title'} style={Theme.list.row}><h3
                    style={Theme.list.title}>{
                    this.props.enumID ? Utils.getObjectName(this.props.objects, this.props.enumID) : I18n.t('Others')
                }</h3>
                    <div style={{width: '100%'}}>{items}</div>
                </div>);
            } else {
                // console.log('NO one element for ' + this.props.enumID + ': ' + this.props.items.join(', '));
                return null;
            }
        } else {
            return null;
        }
    }
}

export default StatesSubList;