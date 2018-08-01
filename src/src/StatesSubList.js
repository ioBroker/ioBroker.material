/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import IconUnreach from 'react-icons/lib/md/perm-scan-wifi';

import Utils from './Utils';
import Theme from './theme';
import I18n from './i18n';
import SmartTile from './SmartTile';
import SmartDetector from './States/SmartDetector';
import Types from './States/SmartTypes';

const styles = {
    'drag-item': {
        display: 'inline-block'
    }
};

class StatesSubList extends Component {

    static propTypes = {
        enumID:         PropTypes.string.isRequired,
        enumSubID:      PropTypes.string.isRequired,
        user:           PropTypes.string.isRequired,
        objects:        PropTypes.object.isRequired,
        editMode:       PropTypes.bool.isRequired,
        debug:          PropTypes.bool,
        ignoreIndicators: PropTypes.array,
        windowWidth:    PropTypes.number,
        align:          PropTypes.string,
        newLine:        PropTypes.bool,
        isUseBright:    PropTypes.bool,
        states:         PropTypes.object.isRequired,
        keys:           PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.detector = new SmartDetector();
        this.state = {
            visible: false,
            newLine: false,
            align: this.props.align,
            enumID: this.props.enumID,
            enumSubID: this.props.enumSubID,
            visibleChildren: {}
        };
        if (this.state.enumID === Utils.INSTANCES) {
            this.name = I18n.t('All instances');
        } else {
            this.name = this.state.enumSubID && this.state.enumSubID !== 'others' ? Utils.getObjectName(this.props.objects, this.state.enumSubID, false, {language: I18n.getLanguage()}) : I18n.t('Others');
        }
        this.collectVisibility = null;
        this.collectVisibilityTimer = null;
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {
        const newState = {};
        let changed = false;

        if (nextProps.newLine !== this.state.newLine) {
            newState.newLine = nextProps.newLine;
            changed = true;
        }

        if (nextProps.align !== this.state.align) {
            newState.align = nextProps.align;
            changed = true;
        }

        if (nextProps.enumID !== this.state.enumID) {
            newState.enumID = nextProps.enumID;
            newState.visibleChildren = {};
            newState.visible = false;
            changed = true;
        }
        if (nextProps.enumSubID !== this.state.enumSubID) {
            this.name = nextProps.enumSubID ? Utils.getObjectName(this.props.objects, nextProps.enumSubID, false, {language: I18n.getLanguage()}) : I18n.t('Others');
            newState.enumSubID = nextProps.enumSubID;
            newState.visibleChildren = {};
            newState.visible = false;
            changed = true;
        }
        if (changed) {
            this.setState(newState);
        }
    }

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        /*const items = reorder(
            this.state.items,
            result.source.index,
            result.destination.index
        );

        this.setState({
            items,
        });*/
        this.forceUpdate();
    }

    onVisibilityTimer() {
        this.collectVisibilityTimer = null;
        let commonVisible = false;
        const combinedVisibility = Object.assign({}, this.state.visibleChildren, this.collectVisibility);
        for (const _id in combinedVisibility) {
            if (combinedVisibility.hasOwnProperty(_id) && combinedVisibility[_id]) {
                commonVisible = true;
                break;
            }
        }
        const newState = {visibleChildren: combinedVisibility};
        if (this.state.visible !== commonVisible) {
            newState.visible = commonVisible;
            this.props.onVisibilityControl && this.props.onVisibilityControl(this.state.enumSubID, commonVisible);
        }

        this.setState(newState);
        this.collectVisibility = null;
    }

    onVisibilityControl(id, visible) {
        const oldState = this.collectVisibility && this.collectVisibility[id] !== undefined ? this.collectVisibility[id] : this.state.visibleChildren[id];

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
            enumNames={[this.name, Utils.getObjectName(this.props.objects, this.state.enumID, null, {language: I18n.getLanguage()})]}
            enumFunctions={this.props.enumFunctions}
            editMode={this.props.editMode}
            channelInfo={channelInfo}
            ignoreIndicators={this.props.ignoreIndicators}
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
        const usedIds = [];
        if (this.props.enumID === Utils.INSTANCES) {
            return items.map(function (id, i) {
                return this.createControl(SmartTile, id, {
                    states: [
                        {id: id + '.alive',     name: 'ALIVE'},
                        {id: id + '.connected', name: 'UNREACH', type: 'boolean', indicator: true, icon: IconUnreach, color: Theme.tile.tileIndicatorsIcons.unreach}
                    ],
                    type: Types.instance
                }, i);
            }.bind(this));
        }
        const controls = items.map(function (id, i) {
            if (this.state[id] === undefined) {
                //debugger;
            }

            /*if (!that.props.editMode && that.state[id] === false) {
                return null;
            }*/
            let controls = this.detector.detect(this.props.objects, id, this.props.keys, usedIds, this.props.ignoreIndicators);
            if (controls) {
                controls = controls.map(control => {
                    return {control: this.createControl(SmartTile, id, control, i), id: control.states.find(state => state.id).id};
                });
            } else {
                this.props.debug && console.log('Nothing found for ' + id);
            }
            if (!controls || !controls.length) {
                return null;
            } else if (controls.length === 1) {
                return controls[0];
            } else {

                return controls;
            }
        }.bind(this));

        let result = [];
        controls.forEach(c => {
            if (c instanceof Array) {
                result = result.concat(c);
            } else if (c) {
                result.push(c);
            }
        });

        return result.sort(function (a, b) {
            const av = this.state.visibleChildren[a.id];
            const bv = this.state.visibleChildren[b.id];
            if (av < bv) return 1;
            if (av > bv) return -1;
            return 0;
        }.bind(this)).map(e => e.control);
    }

    wrapItem(item, index) {
        return (<Draggable key={'item-' + index} draggableId={index} index={index}>
            {(provided, snapshot) => (
                <div
                    className={this.props.classes['drag-item']}
                    style={{display: 'inline-block'}}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    {item}
                </div>
            )}
        </Draggable>);
    }
    onDragStart() {
        console.log('start');
        console.log(JSON.stringify(this.myEl.getBoundingClientRect()));

    }
    attachRef(el, provided) {
        this.myEl = el;
        return provided.innerRef(el);
    }
    wrapAllItems(items, provided, snapshot) {
        return (<div style={{display: 'flex'}} ref={el => this.attachRef(el, provided)} {...provided.droppableProps}>
                {items.map((item, index) => this.wrapItem(item, index))}
                {provided.placeholder}
            </div>);
    }
    wrapContent(items) {
        if (this.props.editMode) {
            return(
                <DragDropContext onDragEnd={this.onDragEnd} onDragStart={() => this.onDragStart()}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => this.wrapAllItems(items, provided, snapshot)}
                    </Droppable>
                </DragDropContext>
            );
        } else {
            return (<div>{items}</div>);
        }
    }
    render() {
        if (this.props.items && this.props.items.length) {
            let items = this.getListItems(this.props.items);
            items = items.filter(e => e);
            if (items.length) {
                const visible = this.state.visible || this.props.editMode;

                const display = !visible ? {display: 'none'} : (this.state.newLine ? {display: 'block', border: 'none'} : {display: 'inline-block'});

                if (this.state.align) {
                    display.textAlign = this.state.align;
                }

                //style={Object.assign({}, Theme.list.row, {display: display})}
                return (<div key={(this.state.enumID + '-' + this.state.enumSubID).replace(/[^\w\d]/g, '_') + '-title'}
                             style={Object.assign({}, Theme.list.row, display)}><h3
                    style={Object.assign({}, Theme.list.title, {color: this.props.isUseBright ? 'white' : 'black'})}>{this.name}</h3>
                    {this.wrapContent(items)}
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

export default withStyles(styles)(StatesSubList);