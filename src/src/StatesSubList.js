import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from './Utils';
import Theme from './theme';
import I18n from './i18n';
import SmartTile from './SmartTile';
import SmartDetector from './States/SmartDetector';

class StatesSubList extends Component {

    static propTypes = {
        enumID:     PropTypes.string.isRequired,
        enumSubID:  PropTypes.string.isRequired,
        user:       PropTypes.string.isRequired,
        objects:    PropTypes.object.isRequired,
        editMode:   PropTypes.bool.isRequired,
        windowWidth: PropTypes.number,
        newLine:    PropTypes.bool,
        states:     PropTypes.object.isRequired,
        keys:       PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.detector = new SmartDetector();
        this.state = {
            visible: false,
            newLine: false,
            enumID: this.props.enumID,
            enumSubID: this.props.enumSubID,
            visibileChildren: {}
        };
        this.name = this.state.enumSubID ? Utils.getObjectName(this.props.objects, this.state.enumSubID, false, [this.state.enumID]) : I18n.t('Others');
        this.collectVisibility = null;
        this.collectVisibilityTimer = null;
    }

    componentWillUpdate(nextProps, nextState) {
        const newState = {};
        let changed = false;

        if (nextProps.newLine !== this.state.newLine) {
            newState.newLine = nextProps.newLine;
            changed = true;
        }

        if (nextProps.enumID !== this.state.enumID) {
            newState.enumID = nextProps.enumID;
            newState.visibileChildren = {};
            newState.visible = false;
            changed = true;
        }
        if (nextProps.enumSubID !== this.state.enumSubID) {
            this.name = nextProps.enumSubID ? Utils.getObjectName(this.props.objects, nextProps.enumSubID, false, [nextProps.enumID || this.state.enumID]) : I18n.t('Others');
            newState.enumSubID = nextProps.enumSubID;
            newState.visibileChildren = {};
            newState.visible = false;
            changed = true;
        }
        if (changed) {
            this.setState(newState);
        }
    }

    onVisibilityTimer() {
        this.collectVisibilityTimer = null;
        let commonVisible = false;
        const combinedVisibility = Object.assign({}, this.state.visibileChildren, this.collectVisibility);
        for (const _id in combinedVisibility) {
            if (combinedVisibility.hasOwnProperty(_id) && combinedVisibility[_id] ) {
                commonVisible = true;
                break;
            }
        }
        const newState = {visibileChildren: combinedVisibility};
        if (this.state.visible !== commonVisible) {
            newState.visible = commonVisible;
            this.props.onVisibilityControl && this.props.onVisibilityControl(this.state.enumSubID, commonVisible);
        }

        this.setState(newState);
        this.collectVisibility = null;
    }

    onVisibilityControl(id, visible) {
        const oldState = this.collectVisibility && this.collectVisibility[id] !== undefined ? this.collectVisibility[id] : this.state.visibileChildren[id];

        if (oldState !== visible) {
            this.collectVisibility = this.collectVisibility || {};
            this.collectVisibility[id] = visible;
            if (this.collectVisibilityTimer) {
                clearTimeout(this.collectVisibilityTimer);
            }
            this.collectVisibilityTimer = setTimeout(() => this.onVisibilityTimer(), 0);
        }
    }

    createControl(control, channelId, channelInfo, i) {
        const state = channelInfo.states.find(state => state.id);

        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={state.id + '-sublist-' + Component.name + '-' + i}
            id={channelId}
            enumNames={[this.name, Utils.getObjectName(this.props.objects, this.state.enumID)]}
            enumFunctions={this.props.enumFunctions}
            editMode={this.props.editMode}
            channelInfo={channelInfo}
            windowWidth={this.props.windowWidth}
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
            let controls = that.detector.detect(that.props.objects, id, that.props.keys, usedIds);
            if (controls) {
                controls = controls.map(contorl => that.createControl(SmartTile, id, contorl, i));
            } else {
                console.log('Nothing found for ' + id);
            }
            if (!controls || !controls.length) {
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

                const display = !visible ? {display: 'none'} : (this.state.newLine ? {display: 'block', border: 'none'} : {display: 'inline-block'});

                //style={Object.assign({}, Theme.list.row, {display: display})}
                return (<div key={(this.state.enumID + '-' + this.state.enumSubID).replace(/[^\w\d]/g, '_') + '-title'}
                             style={Object.assign({}, Theme.list.row, display)}><h3
                    style={Theme.list.title}>{this.name}</h3>
                    <div style={{width: '100%'}}>{items}</div>
                </div>);
            } else {
                // console.log('NO one element for ' + this.state.enumID + ': ' + this.props.items.join(', '));
                return null;
            }
        } else {
            return null;
        }
    }
}

export default StatesSubList;