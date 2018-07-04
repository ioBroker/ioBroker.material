import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TileSmart from './TileSmart';
import CircularProgress from '@material-ui/core/CircularProgress';
import Theme from './theme';
import StatesSubList from './StatesSubList';

class StatesList extends Component {

    static propTypes = {
        enumID:   PropTypes.string.isRequired,
        user:     PropTypes.string.isRequired,
        objects:  PropTypes.object.isRequired,
        editMode: PropTypes.bool.isRequired,
        states:   PropTypes.object.isRequired,
        background: PropTypes.string.isRequired,
        backgroundId: PropTypes.integer,
        loading:  PropTypes.bool.isRequired,
        newLine:  PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.enumFunctions = [];
        this.state = {
            visible: false,
            newLine: false,
            enumID: this.props.enumID,
            background: this.props.background,
            backgroundId: this.props.backgroundId,
            visibileChildren: {}
        };
        this.keys = null;
        this.collectVisibility = null;
        this.collectVisibilityTimer = null;
    }

    componentWillUpdate(nextProps, nextState) {
        if (!this.enumFunctions.length) {
            this.getEnumFunctions(nextProps.objects).forEach(e => this.enumFunctions.push(e));
        }
        const newState = {};
        let changed = false;

        if (nextProps.newLine !== this.state.newLine) {
            newState.newLine = nextProps.newLine;
            changed = true;
        }

        if (nextProps.background !== this.state.background) {
            newState.background = nextProps.background;
            changed = true;
        }
        if (nextProps.backgroundId !== this.state.backgroundId) {
            newState.backgroundId = nextProps.backgroundId;
            changed = true;
        }
        if (nextProps.enumID !== this.state.enumID) {
            newState.enumID = nextProps.enumID;
            newState.visibileChildren = {};
            newState.visible = false;
            changed = true;
        }

        if (changed) {
            this.setState(newState);
        }
    }

    getElementsToShow() {
        let _enum = this.props.objects[this.state.enumID];

        return _enum && _enum.common ? _enum.common.members || [] : [];
    }

    getEnums(objects, enums) {
        objects = objects || this.props.objects;
        let result = [];

        for (let id in objects) {
            if (objects.hasOwnProperty(id) &&
                objects[id] &&
                objects[id].common &&
                objects[id].common.members &&
                objects[id].common.members.length &&
                id.startsWith(enums)
            ) {
                result.push(id);
            }
        }
        return result;
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
            this.props.onVisibilityControl && this.props.onVisibilityControl(this.props.enumSubID, commonVisible);
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

    getEnumFunctions() {
        return this.getEnums('enum.functions.');
    }

    render() {
        let items = this.getElementsToShow();
        let columns = [];

        if (!this.keys || !this.keys.length) {
            this.keys = Object.keys(this.props.objects);
            this.keys.sort();
        }
        if (!this.enumFunctions.length) {
            this.getEnumFunctions(this.props.objects).forEach(e => this.enumFunctions.push(e));
        }

        if (!this.props.loading && items && items.length) {
            //let rxItems = this.getListItems(items);
            let orderEnums;
            if (this.state.enumID.startsWith('enum.rooms.')) {
                orderEnums = 'enum.functions.';
            } else
            if (this.state.enumID.startsWith('enum.functions.')) {
                orderEnums = 'enum.rooms.';
            } else {
                orderEnums = 'enum.functions.';
            }

            let enums = this.getEnums(this.props.objects, orderEnums);
            let used = [];
            enums.forEach(id => {
                const obj = this.props.objects[id];
                let column = [];
                if (obj && obj.common && obj.common.members && obj.common.members.length) {
                    column = obj.common.members.filter(item => {
                        return used.indexOf(item) === -1 && items.indexOf(item) !== -1;
                    });
                }

                if (column.length) {
                    console.log('Add to ' + this.state.enumID + '_' + id + ': ' + column.join(', '));
                    columns.push((<StatesSubList
                            key={this.state.enumID + '_' + id + '-list'}
                            objects={this.props.objects}
                            user={this.props.user}
                            states={this.props.states}
                            newLine={this.props.newLine}
                            items={column}
                            onVisibilityControl={this.onVisibilityControl.bind(this)}
                            editMode={this.props.editMode}
                            windowWidth={this.props.width}
                            enumFunctions={this.enumFunctions}
                            enumID={this.state.enumID}
                            enumSubID={id}
                            keys={this.keys}
                            onSaveSettings={this.props.onSaveSettings}
                            onControl={this.props.onControl}
                            onCollectIds={this.props.onCollectIds}/>));
                    column.forEach(id => used.push(id));
                }
            });

            // collect others
            let column = [];
            items.forEach(item => {
                if (used.indexOf(item) === -1) {
                    column.push(item);
                }
            });

            if (column.length) {
                console.log('Add to others: ' + column.join(', '));
                columns.push(<StatesSubList
                    key={'others'}
                    objects={this.props.objects}
                    user={this.props.user}
                    states={this.props.states}
                    items={column}
                    newLine={this.props.newLine}
                    editMode={this.props.editMode}
                    onVisibilityControl={this.onVisibilityControl.bind(this)}
                    windowWidth={this.props.width}
                    enumFunctions={this.enumFunctions}
                    enumID={this.state.enumID}
                    enumSubID="others"
                    keys={this.keys}
                    onSaveSettings={this.props.onSaveSettings}
                    onControl={this.props.onControl}
                    onCollectIds={this.props.onCollectIds}/>);
            }

            if (!this.state.visible) {
                columns.push((<TileSmart
                    key="nothing"
                    editMode={this.props.editMode}
                    user={this.props.user}
                    states={this.props.states}
                    objects={this.props.objects}
                    id=""/>));
            }

            // sort items
            // If functions => by rooms
            // If rooms => by functions
            // else => by functions
            //columns = columns.map((items, i) => <Col key={'col' + i} style={{width: '9em'}}>{items}</Col>);
        } else if (this.props.loading) {
            // no connection
            columns.push((<CircularProgress key="wait-circle" size={60} thickness={7} color="primary" style={{padding: 20}}/>));
        } else  {
            // no items
            columns.push((<TileSmart
                key="nothing"
                editMode={this.props.editMode}
                user={this.props.user}
                states={this.props.states}
                objects={this.props.objects}
                id=""/>));
        }

        let style;
        if (this.state.background) {
            if (this.state.background.match(/\.jpg$|\.gif$|\.png$|\.jpeg$/)) {
                style = Object.assign({}, Theme.mainPanel, {backgroundSize: '100% auto', backgroundImage: 'url(' + this.state.background + (this.state.backgroundId ? '?ts=' + Date.now() : '') + ')'});
            } else {
                style = Object.assign({}, Theme.mainPanel, {background: this.state.background, backgroundImage: 'none'});
            }
        } else {
            style = Theme.mainPanel;
        }

        return (<div style={Object.assign({marginLeft: this.props.marginLeft}, style)}>{columns}</div>);
    }
}

export default StatesList;