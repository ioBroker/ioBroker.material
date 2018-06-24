import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Tile from './Tile';
import CircularProgress from '@material-ui/core/CircularProgress';
import Theme from './theme';
import StatesSubList from './StatesSubList';

class StatesList extends Component {

    static propTypes = {
        enumID:   PropTypes.string.isRequired,
        objects:  PropTypes.object.isRequired,
        editMode: PropTypes.bool.isRequired,
        states:   PropTypes.object.isRequired,
        loading:  PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        this.enumFunctions = [];
        this.keys = null;
    }

    componentWillUpdate(nextProps, nextState) {
        if (!this.enumFunctions.length) {
            this.getEnumFunctions(nextProps.objects).forEach(function (e) {this.enumFunctions.push(e)});
        }
    }

    getElementsToShow() {
        let _enum = this.props.objects[this.props.enumID];

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

    getEnumFunctions(objects) {
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
            this.getEnumFunctions(this.props.objects).forEach(function (e) {this.enumFunctions.push(e)});
        }

        if (!this.props.loading && items && items.length) {
            //let rxItems = this.getListItems(items);
            let orderEnums;
            if (this.props.enumID.startsWith('enum.rooms.')) {
                orderEnums = 'enum.functions.';
            } else
            if (this.props.enumID.startsWith('enum.functions.')) {
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
                    console.log('Add to ' + this.props.enumID + '_' + id + ': ' + column.join(', '));
                    columns.push((<StatesSubList
                            key={this.props.enumID + '_' + id}
                            objects={this.props.objects}
                            states={this.props.states}
                            items={column}
                            editMode={this.props.editMode}
                            windowWidth={this.props.width}
                            enumFunctions={this.enumFunctions}
                            enumID={id}
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
                    states={this.props.states}
                    items={column}
                    editMode={this.props.editMode}
                    windowWidth={this.props.width}
                    enumFunctions={this.enumFunctions}
                    enumID={''}
                    keys={this.keys}
                    onSaveSettings={this.props.onSaveSettings}
                    onControl={this.props.onControl}
                    onCollectIds={this.props.onCollectIds}/>);
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
            columns.push((<Tile key="nothing"  states={this.props.states} objects={this.props.objects} id=""/>));
        }

        return (<div style={Object.assign({marginLeft: this.props.marginLeft}, Theme.mainPanel)}>{columns}</div>);
    }
}

export default StatesList;