/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SmartTile from '../SmartTile/SmartTile';
import { withStyles } from '@material-ui/core/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { FaArrowsAltV as IconVertical } from 'react-icons/fa'
import { MdAdd as IconAdd } from 'react-icons/md'
import { FaArrowsAltH as IconHorizontal } from 'react-icons/fa'
import Tooltip from '@material-ui/core/Tooltip';

import Theme from '../theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import I18n from '@iobroker/adapter-react/i18n';
import StatesSubList from '../StatesSubList/StatesSubList';
import Clock from '../basic-controls/react-clock/Clock';
import cls from './style.module.scss';
import clsx from 'clsx';
import SmartDialogWidget from '../Dialogs/SmartDialogWidget';
import CustomFab from '../States/components/CustomFab';
import EchartIframe from '../basic-controls/react-echart/EchartIframe';


const styles = {
    'drag-item': {
        display: 'inline-block',
        width: '100%'
    },
    'drag-item-overlay': {
        backgroundColor: 'green',
        borderRadius: '1em'
    },
    'sub-list-disabled-overflow': {
        top: 0,
        bottom: 0,
        position: 'absolute',
        right: 0,
        left: 0,
        zIndex: 2,
        backgroundColor: 'rgba(90,90,90,0.5)'
    },
    'drag-button': {
        position: 'fixed',
        top: 70,
        right: 30,
        zIndex: 4,
        padding: '0 !important'
    },
    'add-button': {
        position: 'fixed',
        top: 70,
        right: 100,
        zIndex: 4,
        padding: '0 !important'
    }
};

class StatesList extends Component {

    static propTypes = {
        enumID: PropTypes.string.isRequired,
        user: PropTypes.string.isRequired,
        objects: PropTypes.object.isRequired,
        editMode: PropTypes.bool.isRequired,
        states: PropTypes.object.isRequired,
        connected: PropTypes.bool.isRequired,
        debug: PropTypes.bool,
        background: PropTypes.string.isRequired,
        backgroundId: PropTypes.number,
        backgroundColor: PropTypes.string,
        align: PropTypes.string,
        ignoreIndicators: PropTypes.array,
        windowWidth: PropTypes.number,
        windowHeight: PropTypes.number,
        newLine: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.enumFunctions = [];

        this.state = {
            visible: false,
            newLine: false,
            dragging: false,
            subDragging: false,
            widgetDialog: false,
            enumID: this.props.enumID,
            align: this.props.align,
            order: Utils.getSettingsOrder(this.props.objects[this.props.enumID], null, { user: this.props.user }),
            customURLs: Utils.getSettingsCustomURLs(this.props.objects[this.props.enumID], null, { user: this.props.user }),
            background: this.props.background,
            backgroundId: this.props.backgroundId,
            visibleChildren: {}
        };
        if (this.state.order !== null && !(this.state.order instanceof Array)) {
            this.state.order = null;
        }
        this.keys = null;
        this.collectVisibility = null;
        this.collectVisibilityTimer = null;
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (!this.enumFunctions.length) {
            this.getEnumFunctions(nextProps.objects).forEach(e => this.enumFunctions.push(e));
        }
        const newState = {};
        let changed = false;

        if (nextProps.newLine !== this.state.newLine) {
            newState.newLine = nextProps.newLine;
            changed = true;
        }

        if (nextProps.backgroundColor !== this.state.backgroundColor) {
            newState.backgroundColor = nextProps.backgroundColor;
            changed = true;
        }
        if (nextProps.background !== this.state.background) {
            newState.background = nextProps.background;
            changed = true;
        }
        if (nextProps.align !== this.state.align) {
            newState.align = nextProps.align;
            changed = true;
        }
        if (nextProps.backgroundId !== this.state.backgroundId) {
            newState.backgroundId = nextProps.backgroundId;
            changed = true;
        }
        if (nextProps.enumID !== this.state.enumID) {
            newState.enumID = nextProps.enumID;
            newState.order = Utils.getSettingsOrder(this.props.objects[newState.enumID], null, { user: this.props.user });
            if (newState.order !== null && !(newState.order instanceof Array)) {
                newState.order = null;
            }
            newState.customURLs = Utils.getSettingsCustomURLs(this.props.objects[newState.enumID], null, { user: this.props.user });

            this.order = null;
            newState.visibleChildren = {};
            newState.visible = false;
            this.keys = null;
            changed = true;
        }

        if (changed) {
            this.setState(newState);
        }
    }

    onDragEnd(result) {
        const newState = { dragging: false };

        if (result.destination && result.destination.index !== result.source.index) {
            this.order = Utils.reorder(this.order, result.source.index, result.destination.index);
            newState.order = this.order;
            const settings = Utils.getSettings(this.props.objects[this.props.enumID], { user: this.props.user });
            settings.order = settings.order || {};
            settings.order = this.order.filter(id => this.state.visibleChildren[id]);
            this.props.onSaveSettings && this.props.onSaveSettings(this.props.enumID, settings);
        }

        this.setState(newState);
    }

    getElementsToShow() {
        if (this.props.enumID === Utils.INSTANCES) {
            return Object.keys(this.props.objects).filter(id => !this.props.objects[id].common.onlyWWW).sort((a, b) => {
                const objA = this.props.objects[a].common;
                const objB = this.props.objects[b].common;
                if (objA.onlyWWW && objB.onlyWWW) {
                    if (objA.name > objB.name) return 1;
                    if (objA.name < objB.name) return -1;
                    return 0;
                } else if (objA.onlyWWW) {
                    return 1;
                } else if (objB.onlyWWW) {
                    return -1;
                } else {
                    if (objA.name > objB.name) return 1;
                    if (objA.name < objB.name) return -1;
                    return 0;
                }
            });
        } else {
            let _enum = this.props.objects[this.state.enumID];

            return _enum && _enum.common ? _enum.common.members || [] : [];
        }
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
        const combinedVisibility = Object.assign({}, this.state.visibleChildren, this.collectVisibility);
        for (const _id in combinedVisibility) {
            if (combinedVisibility.hasOwnProperty(_id) && combinedVisibility[_id]) {
                commonVisible = true;
                break;
            }
        }
        const newState = { visibleChildren: combinedVisibility };

        if (this.state.visible !== commonVisible) {
            newState.visible = commonVisible;
            this.props.onVisibilityControl && this.props.onVisibilityControl(this.props.enumSubID, commonVisible);
        }

        this.setState(newState);
        this.collectVisibility = null;
    }

    onVisibilityControl = (id, visible) => {
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

    onDelete = id => {
        if (id === this.props.enumID) {
            const customURLs = Utils.getSettingsCustomURLs(this.props.objects[this.props.enumID], null, { user: this.props.user });
            this.setState({ customURLs });
        }
    }

    getEnumFunctions() {
        return this.getEnums('enum.functions.');
    }

    wrapItem(id, items, isUseBright, index) {
        if (!this.state.subDragging && this.props.editMode && id !== 'nothing' && id !== Utils.INSTANCES) {
            return (<Draggable
                key={this.state.enumID + '_' + id + '-list1'}
                draggableId={this.state.enumID + '_' + id + '-list'} index={index}>
                {(provided, snapshot) => (
                    <div
                        key={this.state.enumID + '_' + id + '-list2'}
                        className={clsx(cls.drag, snapshot.isDragging && cls.dragStyle)}
                        // className={this.props.classes['drag-item'] + (snapshot.isDragging ? ' ' + this.props.classes['drag-item-overlay'] : '')}
                        // style={{ display: 'inline-block' }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    ><StatesSubList
                            key={this.state.enumID + '_' + id + '-list'}
                            objects={this.props.objects}
                            user={this.props.user}
                            states={this.props.states}
                            newLine={this.props.newLine}
                            socket={this.props.socket}
                            allObjects={this.props.allObjects}
                            systemConfig={this.props.systemConfig}
                            widthBlock={this.props.widthBlock}
                            items={items}
                            isUseBright={isUseBright}
                            ignoreIndicators={this.props.ignoreIndicators}
                            onVisibilityControl={this.onVisibilityControl}
                            onDelete={this.onDelete}
                            themeType={this.props.themeType}
                            themeName={this.props.themeName}
                            debug={this.props.debug}
                            align={this.state.align}
                            editMode={this.props.editMode}
                            windowWidth={this.props.windowWidth}
                            enumFunctions={this.enumFunctions}
                            enumID={id === Utils.INSTANCES ? Utils.INSTANCES : this.state.enumID}
                            enumSubID={id === Utils.INSTANCES ? '' : id}
                            keys={this.keys}
                            onSaveSettings={this.props.onSaveSettings}
                            onControl={this.props.onControl}
                            onCollectIds={this.props.onCollectIds}
                            dragHandleProps={provided.dragHandleProps}
                            subDragging={false}
                        />
                    </div>
                )}
            </Draggable>);
        } else {
            const control = (<StatesSubList
                key={this.state.enumID + '_' + id + '-list'}
                objects={this.props.objects}
                user={this.props.user}
                states={this.props.states}
                newLine={this.props.newLine}
                socket={this.props.socket}
                allObjects={this.props.allObjects}
                systemConfig={this.props.systemConfig}
                widthBlock={this.props.widthBlock}
                items={items}
                isUseBright={isUseBright}
                ignoreIndicators={this.props.ignoreIndicators}
                onVisibilityControl={this.onVisibilityControl}
                onDelete={this.onDelete}
                debug={this.props.debug}
                align={this.state.align}
                editMode={this.props.editMode}
                themeType={this.props.themeType}
                themeName={this.props.themeName}
                windowWidth={this.props.windowWidth}
                enumFunctions={this.enumFunctions}
                enumID={id === Utils.INSTANCES ? Utils.INSTANCES : this.state.enumID}
                enumSubID={id === Utils.INSTANCES ? '' : id}
                keys={this.keys}
                onSaveSettings={this.props.onSaveSettings}
                onControl={this.props.onControl}
                onCollectIds={this.props.onCollectIds}
                subDragging={true}
            />);
            if (this.props.editMode) {
                return (<div
                    key={this.state.enumID + '_' + id + '-list2'}
                    className={this.props.classes['drag-item']}
                    style={{ display: 'inline-block' }}
                >{control}</div>);
            } else {
                return control;
            }

        }
    }
    getDialogWidget = () => {
        if (!this.state.widgetDialog) {
            return null;
        }
        return <SmartDialogWidget
            dialogKey="WidgetKey"
            key="WidgetKey"
            transparent
            overflowHidden
            name={I18n.t('Widgets')}
            enumNames={this.props.enumNames}
            objects={this.props.objects}
            windowWidth={this.props.windowWidth}
            onClose={this.onDialogClose}
            arrayWidgets={[
                {
                    component:
                        <Clock
                            secondsParams={true}
                            dayOfWeekParams={true}
                            hour12Params={true}
                            date={true}
                            doubleSize={true}
                        />,
                    name: I18n.t('Add custom Clock'),
                    onClick: this.onAddCustomClock
                },
                {
                    component:
                        <div className={cls.customUrlWrapper}>
                            <div className={cls.customUrlWrapperText}>
                                {I18n.t('Custom URL')}
                            </div>
                        </div>,
                    name: I18n.t('Add custom URL'),
                    onClick: this.onAddCustomURL
                },
                {
                    component: <EchartIframe />,
                    name: I18n.t('Add custom e-chart'),
                    onClick: this.onAddCustomEchart
                }
            ]
            }
        />
    }
    wrapAllItems(columns, provided, snapshot, style) {
        style = Object.assign({ marginLeft: this.props.marginLeft, width: 'calc(100% - ' + this.props.marginLeft + 'px)' }, style);

        return (
            <div style={style} ref={provided.innerRef} {...provided.droppableProps}>
                {columns}
                {provided.placeholder}
                {this.getToggleDragButton()}
                {/* {this.getAddButton()} */}
                {this.getAddButtonWidgets()}
                {this.getDialogWidget()}
                {/* {this.getAddButtonWhether()} */}
            </div>);
    }

    getToggleDragButton() {
        if (this.props.editMode && this.props.enumID !== Utils.INSTANCES) {
            return (<CustomFab key={this.props.dialogKey + '-drag-button'}
                size="small"
                title={I18n.t('Drag direction')}
                style={{ fontSize: 24 }}
                onClick={() => this.setState({ subDragging: !this.state.subDragging })}
                className={this.props.classes['drag-button']}>
                {this.state.subDragging ? <IconHorizontal /> : <IconVertical />}
            </CustomFab>);
        } else {
            return null;
        }
    }

    onAddCustomURL = () => {
        const newState = { customURLs: JSON.parse(JSON.stringify(this.state.customURLs || [])) };

        newState.customURLs.push({
            type: 'url',
            name: 'URL',
            title: I18n.t('Custom URL'),
            id: '_custom_' + Date.now(),
            settingsId: this.state.enumID,
            enabled: true,
            fullWidth: true,
            doubleSize: true
        });

        this.order = null;

        const settings = Utils.getSettings(this.props.objects[this.props.enumID], { user: this.props.user });
        settings.URLs = newState.customURLs;
        this.props.onSaveSettings && this.props.onSaveSettings(this.props.enumID, settings, () => {
            this.setState(newState);
        });
    }

    onAddCustomClock = () => {
        const newState = { customURLs: JSON.parse(JSON.stringify(this.state.customURLs || [])) };

        newState.customURLs.push({
            type: 'clock',
            name: 'Clock',
            title: I18n.t('Custom Clock'),
            id: '_custom_' + Date.now(),
            settingsId: this.state.enumID,
            doubleSize: true,
            enabled: true,
            seconds: false,
            "12/24": false,
            dayOfWeek: true
        });

        this.order = null;

        const settings = Utils.getSettings(this.props.objects[this.props.enumID], { user: this.props.user });
        settings.URLs = newState.customURLs;
        this.props.onSaveSettings && this.props.onSaveSettings(this.props.enumID, settings, () => {
            this.setState(newState);
        });
    }

    onAddCustomEchart = () => {
        const newState = { customURLs: JSON.parse(JSON.stringify(this.state.customURLs || [])) };

        newState.customURLs.push({
            type: 'e-chart',
            name: 'Echart',
            title: I18n.t('Custom e-chart'),
            id: '_custom_' + Date.now(),
            settingsId: this.state.enumID
        });

        this.order = null;

        const settings = Utils.getSettings(this.props.objects[this.props.enumID], { user: this.props.user });
        settings.URLs = newState.customURLs;
        this.props.onSaveSettings && this.props.onSaveSettings(this.props.enumID, settings, () => {
            debugger
            this.setState(newState);
        });
    }

    onAddCustomWhether() {
        const newState = { customURLs: JSON.parse(JSON.stringify(this.state.customURLs || [])) };

        newState.customURLs.push({
            type: 'whether',
            title: I18n.t('Custom Whether'),
            id: '_custom_' + Date.now(),
            settingsId: this.state.enumID,
            doubleSize: true,
            enabled: true,
            seconds: false,
            "12/24": false,
            dayOfWeek: true
        });

        this.order = null;

        const settings = Utils.getSettings(this.props.objects[this.props.enumID], { user: this.props.user });
        settings.URLs = newState.customURLs;
        this.props.onSaveSettings && this.props.onSaveSettings(this.props.enumID, settings, () => {
            this.setState(newState);
        });
    }

    // getAddButton() {
    //     if (this.props.editMode && this.props.enumID !== Utils.INSTANCES) {
    //         return (<CustomFab key={this.props.dialogKey + '-add-button'}
    //             size="small"
    //             title={I18n.t('Add custom URL')}
    //             style={{ fontSize: 24 }}
    //             onClick={() => this.onAddCustomURL()}
    //             className={this.props.classes['add-button']}>
    //             <IconAdd />
    //         </CustomFab>);
    //     } else {
    //         return null;
    //     }
    // }

    getAddButtonWidgets() {
        if (this.props.editMode && this.props.enumID !== Utils.INSTANCES) {
            return (
                <Tooltip title={I18n.t('Widgets')}>
                    <CustomFab
                        size="small"
                        title={I18n.t('Widgets')}
                        style={{ fontSize: 24 }}
                        onClick={this.onDialogOpen}
                        className={cls.buttonClock}>
                        <IconAdd />
                    </CustomFab>
                </Tooltip>);
        } else {
            return null;
        }
    }

    // getAddButtonWhether() {
    //     if (this.props.editMode && this.props.enumID !== Utils.INSTANCES) {
    //         return (<Fab
    //             size="small"
    //             title={I18n.t('Add custom Clock')}
    //             style={{ fontSize: 24 }}
    //             onClick={() => this.onAddCustomWhether()}
    //             className={cls.buttonWhether}>
    //             <IconAdd />
    //         </Fab>);
    //     } else {
    //         return null;
    //     }
    // }
    onDialogClose = () => {
        this.setState({ widgetDialog: false });
    }

    onDialogOpen = () => {
        this.setState({ widgetDialog: true });
    }

    wrapContent(columns, isNothing) {
        let style;
        if (this.state.background) {
            if (this.state.background.match(/\.jpg$|\.gif$|\.png$|\.jpeg$/)) {
                style = Object.assign({}, {
                    backgroundSize: this.props.windowWidth > this.props.windowHeight ? '100% auto' : 'auto 100%',
                    backgroundImage: 'url(' + this.state.background + (this.state.backgroundId ? '?ts=' + Date.now() : '') + ')'
                });
            } else {
                style = Object.assign({}, { background: this.state.background, backgroundImage: 'none' });
            }
        } else if (this.state.backgroundColor) {
            style = Object.assign({}, { background: this.state.backgroundColor, backgroundImage: 'none' });
        } else {
            style = Object.assign({}, { backgroundSize: this.props.windowWidth > this.props.windowHeight ? '100% auto' : 'auto 100%' });
        }

        if (this.state.align && !this.state.dragging) {
            style.textAlign = this.state.align;
        }

        if (!this.state.subDragging && this.props.editMode && this.props.enumID !== Utils.INSTANCES && !isNothing) {
            return (<div className={cls.droppableList}>
                <DragDropContext onDragEnd={result => this.onDragEnd(result)} onDragStart={() => this.setState({ dragging: true })}>
                    <Droppable droppableId="mainList" direction="vertical">
                        {(provided, snapshot) => this.wrapAllItems(columns, provided, snapshot, style)}
                    </Droppable>
                </DragDropContext>
            </div>
            );
        } else {
            return (<div className={cls.wrapperBlock} style={Object.assign({ marginLeft: this.props.marginLeft }, style)}>
                <div className={cls.block}>
                    {columns}
                    {this.getToggleDragButton()}
                    {/* {this.getAddButton()} */}
                    {this.getAddButtonWidgets()}
                    {this.getDialogWidget()}
                    {/* {this.getAddButtonWhether()} */}
                </div>
            </div>);
        }
    }

    render() {
        let items = this.getElementsToShow();
        if (items.length > 300) {
            return null; // something is wrong
        }

        let columns = [];

        if (!this.keys || !this.keys.length) {
            this.keys = Object.keys(this.props.objects);
            this.keys.sort();
        }
        if (!this.enumFunctions.length) {
            this.getEnumFunctions(this.props.objects).forEach(e => this.enumFunctions.push(e));
        }


        if (this.props.enumID === Utils.INSTANCES) {
            columns.push({ items, id: Utils.INSTANCES });
        } else
            if (items && items.length) {
                let orderEnums;
                if (this.state.enumID && this.state.enumID.startsWith('enum.rooms.')) {
                    orderEnums = 'enum.functions.';
                } else
                    if (this.state.enumID && this.state.enumID.startsWith('enum.functions.')) {
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
                        this.props.debug && console.log('Add to ' + this.state.enumID + '_' + id + ': ' + column.join(', '));
                        columns.push({ id, items: column });
                        column.forEach(id => used.push(id));
                    }
                });

                // collect others
                let column = [];
                items.forEach(item => {
                    if (!used.includes(item) && !column.includes(item)) {
                        column.push(item);
                    }
                });

                if (column.length || (this.state.customURLs && this.state.customURLs.length)) {
                    this.props.debug && console.log('Add to others: ' + column.join(', '));

                    if (this.state.customURLs && this.state.customURLs.length) {
                        this.state.customURLs.forEach(e => {
                            column.push({ id: e.id, settingsId: this.state.enumID, name: e.name, type: e.type });
                        });
                    }

                    if (column.length) {
                        columns.push({ id: 'others', items: column });
                    }
                }
                if (!this.state.visible && !column.length) {
                    columns.push({ id: 'nothing' });
                }
            } else {
                columns.push({ id: 'nothing' });
            }

        if (!this.order) {
            this.order = this.state.order;
            if (!this.order) {
                this.order = columns.map(c => c.id);
            } else {
                // add missing IDs
                columns.forEach(c => this.order.indexOf(c.id) === -1 && this.order.push(c.id));

                // remove deleted IDs
                for (let i = this.order.length - 1; i >= 0; i--) {
                    // if ID does not exist any more
                    if (!columns.find(c => this.order[i] === c.id)) {
                        this.order.splice(i, 1);
                    }
                }
            }
        }

        let pos = this.order.indexOf('nothing');
        if (pos !== -1 && pos !== this.order.length - 1) {
            this.order.splice(pos, 1);
            this.order.push('nothing');
        }
        const background = this.props.backgroundColor;
        const isUseBright = !background || Utils.isUseBright(background);

        const orderedColumns = this.order.map(function (id, i) {
            const elem = columns.find(c => c.id === id);
            if (elem) {
                if (elem.id === 'nothing') {
                    return (<SmartTile
                        key="nothing"
                        editMode={this.props.editMode}
                        user={this.props.user}
                        socket={this.props.socket}
                        allObjects={this.props.allObjects}
                        systemConfig={this.props.systemConfig}
                        widthBlock={this.props.widthBlock}
                        states={this.props.states}
                        objects={this.props.objects}
                        themeType={this.props.themeType}
                        themeName={this.props.themeName}
                        id="" />);
                } else {
                    return this.wrapItem(elem.id, elem.items, isUseBright, i);
                }
            } else {
                return null;
            }
        }.bind(this)).filter(e => e);
        return this.wrapContent(orderedColumns);
    }
}

export default withStyles(styles)(StatesList);
