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
        enumID:     PropTypes.string.isRequired,
        enumSubID:  PropTypes.string.isRequired,
        user:       PropTypes.string.isRequired,
        objects:    PropTypes.object.isRequired,
        editMode:   PropTypes.bool.isRequired,
        states:     PropTypes.object.isRequired,
        keys:       PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.detector = new SmartDetector();
        this.state = {
            visible: false
        };
        this.name = this.props.enumSubID ? Utils.getObjectName(this.props.objects, this.props.enumSubID, false, [this.props.enumID]) : I18n.t('Others')
    }

    isVisible() {
        for (const id in this.state) {
            if (!this.state.hasOwnProperty(id)) continue;
            if (this.props.editMode || this.state[id]) {
                return true;
            }
        }
        return false;
    }

    onVisibilityControl(id, visible) {
        const newState = {};
        if (this.state[id] !== visible) {
            newState[id] = visible;
            let commonVisible = visible;
            if (!commonVisible) {
                for (const _id in this.state) {
                    if (this.state.hasOwnProperty(_id) && _id !== 'visible' && this.state[_id] ) {
                        commonVisible = true;
                        break;
                    }
                }
            }
            if (this.state.visible !== commonVisible) {
                newState.visible = commonVisible;
            }

            this.setState(newState);
        }
    }

    createControl(control, channelId, channelInfo, i) {
        const state = channelInfo.states.find(state => state.id);

        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={state.id + '-sublist-' + Component.name + '-' + i}
            id={channelId}
            enumNames={[this.name, Utils.getObjectName(this.props.objects, this.props.enumID)]}
            enumFunctions={this.props.enumFunctions}
            editMode={this.props.editMode}
            channelInfo={channelInfo}
            states={this.props.states}
            objects={this.props.objects}
            user={this.props.user}
            onVisibilityControl={this.onVisibilityControl.bind(this)}
            onSaveSettings={this.props.onSaveSettings}
            onCollectIds={this.props.onCollectIds}
            onControl={this.props.onControl}
        />);
    }

    getListItems(items) {
        const that = this;
        const usedIds = [];
        return items.map((id, i) => {
            if (that.state[id] === undefined) {
                //debugger;
            }

            /*if (!that.props.editMode && that.state[id] === false) {
                return null;
            }*/
            let detected;
            let someDetected = false;
            let controls = [];
            while((detected = that.detector.detect(that.props.objects, that.props.keys, id, usedIds))) {
                someDetected = true;
                controls.push(that.createControl(TileSmart, id, detected, i));
            }
            if (!someDetected) {
                let channelInfo = Tile.getChannelInfo(that.props.objects, id);
                if (!channelInfo || (channelInfo.main === undefined && (!channelInfo.states || !channelInfo.states.length))) {
                    //console.log('Nothing found for ' + id);
                } else {
                    controls.push(that.createControl(Tile, id, channelInfo, i));
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
        if (this.props.items && this.props.items.length) {
            let items = this.getListItems(this.props.items);
            items = items.filter(e => e);
            if (items.length) {
                const visible = this.state.visible || this.props.editMode;

                return (<div key={(this.props.enumID + '-' + (this.props.enumSubID || 'others')).replace(/[^\w\d]/g, '_') + '-title'} style={Object.assign({}, Theme.list.row, !visible ? {display: 'none'} : {})}><h3
                    style={Theme.list.title}>{this.name}</h3>
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