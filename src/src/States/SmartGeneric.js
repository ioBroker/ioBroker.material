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
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import Utils from '@iobroker/adapter-react/Components/Utils';
import I18n from '@iobroker/adapter-react/i18n';
import Theme from '../theme';

import { MdVisibility as IconCheck } from 'react-icons/md';
import { MdVisibilityOff as IconUncheck } from 'react-icons/md';
import { MdRemove as IconRemoved } from 'react-icons/md';
import { MdEdit as IconEdit } from 'react-icons/md';
import { MdArrowUpward as IconDirectionUp } from 'react-icons/md';
import { MdArrowDownward as IconDirectionDown } from 'react-icons/md';
import { MdSwapVert as IconDirection } from 'react-icons/md';
import cls from './style.module.scss';

import Dialog from '../Dialogs/SmartDialogSettings';
import clsx from 'clsx';
//import ReactEcharts from 'echarts-for-react';
import ReactEchartsCore from 'echarts-for-react/lib/core';

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([GridComponent, LineChart, SVGRenderer]);


// taken from here: https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
function isTouchDevice() {
    if (('ontouchstart' in window) || (window.DocumentTouch && window.document instanceof window.DocumentTouch)) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    const PREFIXES = ' -webkit- -moz- -o- -ms- '.split(' ');
    const mq = query => window.matchMedia(query).matches;
    const query = ['(', PREFIXES.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}

// const isTouch = isTouchDevice();

class SmartGeneric extends Component {
    static propTypes = {
        objects: PropTypes.object.isRequired,
        states: PropTypes.object.isRequired,
        tile: PropTypes.object.isRequired,
        channelInfo: PropTypes.object.isRequired,
        ignoreIndicators: PropTypes.array,
        enumNames: PropTypes.array,
        windowWidth: PropTypes.number,
        user: PropTypes.string
    };

    constructor(props, noSubscribe) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.subscribes = null;
        this.subscribed = false;
        this.defaultIcon = null;

        this.width = Theme.tile.width;
        this.height = Theme.tile.height;
        this.doubleState = false; // has on/off or only info

        this.showCorner = false; // set it to true to show the corner
        this.stateRx = {
            executing: false,
            settings: {},
            showSettings: false,
            editMode: null,
            checkAllStates: false,
            ignoreIndicators: this.props.ignoreIndicators || []
        };
        this.defaultEnabling = true; // overload this property to hide element by default

        this.commaAsDelimiter = this.props.objects['system.config'] && this.props.objects['system.config'].common && this.props.objects['system.config'].common.isFloatComma;

        this.editMode = this.props.editMode;

        this.lastEnabledChange = 0;

        if (typeof noSubscribe !== 'boolean' || !noSubscribe) {
            if (this.channelInfo.states) {
                let ids = [];
                let idActual = this.channelInfo.states.find(el => el.id);
                idActual = idActual.id.split('.');
                idActual.pop();
                this.channelInfo.states.forEach(function (state) {
                    if (!state.id) {
                        let newId = `${idActual.join('.')}.${state.name}`;
                        ids.push(newId);
                        return
                    };

                    if (state.id.startsWith('system.adapter.')) {
                        ids.push(state.id);
                    } else
                        if (!state.noSubscribe &&
                            this.props.objects[state.id] &&
                            this.props.objects[state.id].type === 'state' &&
                            ids.indexOf(state.id) === -1) {
                            const pos = state.id.lastIndexOf('.');
                            if (pos !== -1 && this.stateRx.ignoreIndicators.indexOf(state.id.substring(pos + 1)) !== -1) {
                                return;
                            }

                            ids.push(state.id);
                        }
                }.bind(this));

                if (ids.length) {
                    this.subscribes = ids;

                    // do not want to mutate via setState, because it is constructor
                    ids.forEach(id => this.stateRx[id] = this.props.states[id] ? this.props.states[id].val : null);
                }
            }
        }

        if (this.channelInfo && this.channelInfo.states) {
            this.indicators = {};
            let state = this.channelInfo.states.find(state => state.id && state.name === 'WORKING');
            this.indicators.workingId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'UNREACH');
            this.indicators.unreachId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'LOWBAT');
            this.indicators.lowbatId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'MAINTAIN');
            this.indicators.maintainId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ERROR');
            this.indicators.errorId = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'DIRECTION');
            this.indicators.directionId = state && state.id;

            if (this.indicators.directionId) {
                this.direction = {
                    undef: true,
                    up: 'unused',
                    down: 'unused'
                };
                const obj = this.props.objects[this.indicators.directionId];
                if (obj && obj.common) {
                    if (obj.common.type === 'number') {
                        if (obj.common.states) {
                            for (const index in obj.common.states) {
                                if (!obj.common.states.hasOwnProperty(index)) continue;
                                if (obj.common.states[index].match(/up/i)) {
                                    this.direction.up = index.toString();
                                } else if (obj.common.states[index].match(/down/i)) {
                                    this.direction.down = index.toString();
                                } else if (obj.common.states[index].match(/undef/i)) {
                                    this.direction.undef = index.toString();
                                }
                            }
                        } else {
                            this.direction.undef = 1;
                        }
                    }
                }
            }

            if (this.indicators.errorId) {
                this.errorText = '';
            }
        }

        // will be done in componentReady
        // this.state = stateRx;
        this.echartsReact = createRef();
    }

    componentReady() {
        if (this.stateRx.checkAllStates) {
            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');
            const newState = Object.keys(this.props.allObjects).filter(name => name !== parts && name.startsWith(parts) && !this.channelInfo.states.find(state => state.id === name));
            const newObj = {};
            this.subscribes = this.subscribes.concat(newState);
            newState.forEach(name => {
                newObj[name] = null;
            })
            this.stateRx = Object.assign(this.stateRx, newObj);
        }
        if (this.id && this.props.objects[this.id]) {
            this.settingsId = this.id;
        } else
            if (this.instanceId !== undefined) {
                this.settingsId = this.instanceId;
            }

        if (this.stateRx.showDialog !== undefined) {
            this.showCorner = true;
            this.props.tile.registerHandler('onMouseDown', this.onTileMouseDown);
        }

        if (this.stateRx.showDialogBottom !== undefined) {
            if (this.getIdHistorys(this.getAllIds(true)).length) {
                this.showCornerBottom = true;
            }
            this.props.tile.registerHandler('onMouseDown', this.onTileMouseDownBottom);
        }

        if (this.settingsId) {
            if (this.props.objects[this.settingsId] && this.props.objects[this.settingsId].type === 'instance') {
                this.stateRx.settings = {
                    enabled: true,
                    name: this.props.objects[this.settingsId].common.name + '.' + this.instanceNumber
                }
            } else {
                this.stateRx.settings = Utils.getSettings(
                    this.props.objects[this.settingsId],
                    {
                        user: this.props.user,
                        language: I18n.getLanguage(),
                        name: this.getObjectNameCh()
                    },
                    this.defaultEnabling
                );
            }
            if (this.stateRx.settings.background) {
                this.props.tile.setBackgroundImage(this.stateRx.settings.background || '', true);
            }
        }

        this.stateRx.nameStyle = { fontSize: SmartGeneric.getNameFontSize(this.stateRx.settings.name) };

        this.props.tile.setVisibility(this.stateRx.settings.enabled);

        this.props.tile.setColorOn(this.stateRx.settings.colorOn || Theme.tile.tileOn.background);
        this.props.tile.setColorOff(this.stateRx.settings.colorOff || Theme.tile.tileOff.background);

        if (this.stateRx.settings && this.stateRx.settings.doubleSize) {
            this.width = 2;
        }

        if (this.width > 1) {
            this.props.tile.setSize(this.width);
        }

        //    ↓ ignore error here
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state = this.stateRx;
        delete this.stateRx;
    }

    componentDidMount() {
        if (this.state.settings.enabled && this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }
    }

    static getObjectName(objects, id, label, channelName, enumNames) {
        let name;
        if (label) {
            name = label;
        } else
            if (!id) {
                name = 'No elements';
            } else {
                //if (objects[enumName]) {
                //    enumName = SmartGeneric.getObjectName(objects, enumName);
                //}

                let item = objects[id];
                if (item && item.common && item.common.name) {
                    name = Utils.getObjectName(objects, id, null, { language: I18n.getLanguage() });

                    if (enumNames) {
                        if (typeof enumNames === 'object') {
                            enumNames.forEach(e => {
                                let reg = new RegExp('\\b' + e + '\\b');
                                const newName = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                                if (newName) {
                                    name = newName;
                                }
                            });
                        } else {
                            let reg = new RegExp('\\b' + enumNames + '\\b');
                            const newName = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                            if (newName) {
                                name = newName;
                            }
                        }
                    }
                    if (channelName) {
                        let reg = new RegExp(channelName + '[.: ]?');
                        const newName = name.replace(reg, ' ').trim();
                        if (newName) {
                            name = newName;
                        }
                    }

                    if (name && name === name.toUpperCase()) {
                        name = name[0] + name.substring(1).toLowerCase();
                    }
                } else {
                    let pos = id.lastIndexOf('.');
                    name = id.substring(pos + 1).replace(/_/g, ' ');
                    name = Utils.CapitalWords(name);

                    if (enumNames) {
                        if (typeof enumNames === 'object') {
                            enumNames.forEach(e => {
                                let reg = new RegExp('\\b' + e + '\\b');
                                name = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                            });
                        } else {
                            let reg = new RegExp('\\b' + enumNames + '\\b');
                            name = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                        }
                    }

                    if (channelName) {
                        let reg = new RegExp(channelName + '[.: ]?');
                        name = I18n.t(name.replace(reg, ' ').trim());
                    }
                }
            }
        return name.trim();
    }

    static getParentId(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        } else {
            return id;
        }
    }

    getObjectNameCh() {
        const channelId = SmartGeneric.getParentId(this.id);
        if (this.props.objects[channelId] && (this.props.objects[channelId].type === 'channel' || this.props.objects[channelId].type === 'device')) {
            return SmartGeneric.getObjectName(this.props.objects, channelId, null, null, this.props.enumNames) || '&nbsp;';
        } else {
            return SmartGeneric.getObjectName(this.props.objects, this.id, null, null, this.props.enumNames) || '&nbsp;';
        }
    }

    // default handler
    updateState(id, state) {
        // update indicators
        let val;
        if (!state) {
            return;
        }
        if (this.indicators && id === this.indicators.directionId) {
            val = (state.val !== null && state.val !== undefined) ? state.val.toString() : '';
        } else if (this.indicators && id === this.indicators.errorId) {
            if (typeof state.val === 'string') {
                let i = parseInt(state.val.trim(), 10);
                if (i.toString() === state.val.trim()) {
                    val = i;
                } else {
                    val = state.val === 'true' || state.val === 'on' || state.val === 'ON';
                }
            } else {
                val = typeof state.val === 'number' ? state.val : state.val === true || state.val === 'true' || state.val === 'on' || state.val === 'ON';
            }
            const obj = this.props.objects[id];
            if (obj && obj.common) {
                if (obj.common.min !== undefined && obj.common.min === val) {
                    val = false;
                    this.errorText = '';
                } else if (obj.common.states && obj.common.states[val] !== undefined) {
                    this.errorText = I18n.t(obj.common.states[val]);
                    val = true;
                }
            }
        } else {
            val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        }

        this.setState({[id]: val});
    }

    // default handler
    onControl(id, val) {

    }

    // default handler
    onLongClick = e => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.setState({ showDialog: true });
    }

    onDialogClose = (e) => {
        this.setState({ showDialog: false })
    };

    onLongClickBottom = e => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.setState({ showDialogBottom: true });
    }

    onDialogCloseBottom = () =>
        this.setState({ showDialogBottom: false });

    onMouseUp = () => {
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.onToggleValue && this.onToggleValue();
        }
    }

    onTileMouseDown = e => {
        if (this.state.showDialog) {
            return;
        }
        //e.preventDefault();
        e.stopPropagation();

        this.timer = setTimeout(() => {
            this.timer = null;
            this.onLongClick();
        }, 500);

        document.addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    onTileMouseDownBottom = e => {
        if (this.state.showDialogBottom) {
            return;
        }
        //e.preventDefault();
        e.stopPropagation();

        this.timer = setTimeout(() => {
            this.timer = null;
            this.onLongClickBottom();
        }, 500);

        document.addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    componentWillUnmount() {
        if (this.props.onCollectIds && this.subscribed) {
            this.props.onCollectIds(this, this.subscribes, false);
            this.subscribed = null;
        }
        if (this.expireInSecInterval) {
            clearInterval(this.expireInSecInterval);
            this.expireInSecInterval = null;
        }
        if (this.expireInSecIntervalHistory) {
            clearInterval(this.expireInSecIntervalHistory);
            this.expireInSecIntervalHistory = null;
        }
        this.timer && clearTimer(this.timer);
        this.timer = null;
    }

    saveSettings(newSettings, cb) {
        const settings = newSettings || this.state.settings;
        if (this.props.onSaveSettings && this.settingsId) {
            this.props.onSaveSettings(this.settingsId, settings, { enabled: this.defaultEnabling }, () => {
                // subscribe if enabled and was not subscribed
                if (this.subscribes && settings.enabled && !this.subscribed) {
                    this.subscribed = true;
                    this.props.onCollectIds(this, this.subscribes, true);
                } else
                    // unsubscribe if disabled and was subscribed
                    if (!settings.enabled && this.subscribed) {
                        this.subscribed = false;
                        this.props.onCollectIds(this, this.subscribes, false);
                    }

                this.props.tile.setColorOn(settings.colorOn || Theme.tile.tileOn);
                this.props.tile.setColorOff(settings.colorOff || Theme.tile.tileOff);
                this.props.tile.setVisibility(settings.enabled);
                this.width = settings.doubleSize ? 2 : 1;
                this.props.tile.setSize(this.width);
                cb && cb(settings);
            });
        } else if (this.customSettings) {
            // custom URL
            const enumSettings = Utils.getSettings(this.props.objects[this.customSettings.settingsId], { user: this.props.user });
            let pos = -1;

            if (enumSettings) {
                enumSettings.URLs.forEach((e, i) => {
                    if (e.id === this.id) {
                        pos = i;
                        return false;
                    }
                });
                enumSettings.clocks && enumSettings.clocks.forEach((e, i) => {
                    if (e.id === this.id) {
                        pos = i;
                        return false;
                    }
                });
            }

            if (pos !== -1) {
                if (newSettings) {
                    newSettings = Object.assign({}, this.customSettings, newSettings);
                    enumSettings.URLs[pos] = newSettings;
                } else {
                    enumSettings.URLs.splice(pos, 1);
                }
                const enumId = (newSettings && newSettings.settingsId) || this.customSettings.settingsId;
                this.props.onSaveSettings && this.props.onSaveSettings(enumId, enumSettings, function () {
                    if (!newSettings) {
                        this.props.tile.setDelete(enumId);
                    } else {

                    }
                    cb && cb(newSettings);
                }.bind(this));
            }
        }
    }

    toggleEnabled = () => {
        let settings = JSON.parse(JSON.stringify(this.state.settings));
        settings.enabled = !settings.enabled;

        this.saveSettings(settings, () => this.setState({ settings }));
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed = false;
        if (props.editMode !== state.editMode) {
            newState.editMode = props.editMode;
            //this.props.tile.setVisibility(nextProps.editMode || this.state.settings.enabled);
            changed = true;
        }
        if (JSON.stringify(props.ignoreIndicators) !== JSON.stringify(state.ignoreIndicators)) {
            newState.ignoreIndicators = props.ignoreIndicators;
            changed = true;
        }

        return changed ? newState : null;
    }

    roundValue(value, decimals) {
        if (decimals !== undefined || typeof this.state.settings.decimals !== 'undefined') {
            let val = value.toFixed(decimals !== undefined ? decimals : this.state.settings.decimals);
            if (this.commaAsDelimiter) {
                val = val.replace('.', ',');
            }
            return val;
        } else {
            return value;
        }
    }

    // following indicators are supported
    // indicator.working
    // indicator.lowbat
    // indicator.maintenance.lowbat
    // indicator.maintenance.unreach
    // indicator.maintenance
    // indicator.error
    getIndicators() {
        let result = [];
        const that = this;
        let titles = [];
        this.channelInfo.states.forEach(state => {
            if (state.indicator && state.id) {
                const pos = state.id.lastIndexOf('.');
                if (pos !== -1 && this.state.ignoreIndicators.indexOf(state.id.substring(pos + 1)) !== -1) {
                    return;
                }
                let Icon = state.icon;
                if (state.id === that.indicators.directionId) {
                    const strVal = that.state[state.id];
                    if (strVal === that.direction.up) {
                        Icon = IconDirectionUp;
                    } else if (strVal === that.direction.down) {
                        Icon = IconDirectionDown;
                    } else if (strVal === that.direction.undef) {
                        Icon = IconDirection;
                    } else {
                        return;
                    }
                } else if ((!that.state[state.id] && !state.inverted) || (that.state[state.id] && state.inverted)) {
                    return;
                }

                titles.push(I18n.t(state.id.split('.').pop()));

                state.icon && result.push(<Icon
                    key={that.key + 'indicator-' + state.name.toLowerCase()}
                    className={'indicator-' + state.name.toLowerCase()}
                    style={Object.assign({}, Theme.tile.tileIndicator, { color: state.color || 'inherit' })}
                />);
            }
        });

        if (result.length) {
            if (this.errorText) {
                titles.push(this.errorText)
            }
            return (<div key={this.key + 'indicators'} style={Theme.tile.tileIndicators} title={titles.join(', ')}>{result}</div>);
        } else {
            return null;
        }
    }

    getDefaultIcon() {
        if (this.defaultIcon !== null) {
            return this.defaultIcon;
        }
        if (this.id) {
            let icon = Utils.getObjectIcon(this.id, this.props.objects[this.id]);
            if (!icon) {
                let parentId = SmartGeneric.getParentId(this.id);
                if (this.props.objects[parentId] && this.props.objects[parentId].type === 'channel') {
                    icon = Utils.getObjectIcon(parentId, this.props.objects[parentId]);
                    if (!icon) {
                        parentId = SmartGeneric.getParentId(parentId);
                        if (this.props.objects[parentId] && this.props.objects[parentId].type === 'device') {
                            icon = Utils.getObjectIcon(parentId, this.props.objects[parentId]);
                        }
                    }
                }
            }
            if (icon) {
                this.defaultIcon = icon;
            } else {
                this.defaultIcon = '';
            }
        } else {
            this.defaultIcon = '';
        }
        return this.defaultIcon;
    }

    getDialogSettings(settings) {
        settings = settings || [];

        settings.unshift({
            name: 'background',
            value: this.state.settings.background || '',
            aspect: this.state.settings.doubleSize ? 2 : 1,
            type: 'image'
        });

        if (this.doubleState) {
            settings.unshift({
                name: 'iconOff',
                value: this.state.settings.iconOff || '',
                type: 'icon'
            });
        }
        settings.unshift({
            name: 'icon',
            value: this.state.settings.icon || '',
            type: 'icon'
        });
        // If colors for on and for off
        if (this.doubleState) {
            settings.unshift({
                name: 'colorOff',
                value: this.state.settings.colorOff || '',
                type: 'color'
            });
        }

        if (this.noAck) {
            settings.unshift({
                name: 'doubleSize',
                value: this.state.settings.doubleSize || '',
                type: 'boolean'
            });
        }

        settings.unshift({
            name: 'noAck',
            value: this.state.settings.noAck || '',
            type: 'boolean'
        });

        settings.unshift({
            name: 'colorOn',
            value: this.state.settings.colorOn || '',
            type: 'color'
        });
        settings.unshift({
            name: 'name',
            value: this.state.settings.name || '',
            type: 'string'
        });
        if (this.id) {
            /*settings.unshift({
                name: 'useCommon',getObjectIcon
                value: this.state.settings.useCommon || false,
                type: 'boolean'
            });*/
            let icon = this.getDefaultIcon();
            if (icon) {
                settings.unshift({
                    name: 'useDefaultIcon',
                    value: this.state.settings.useDefaultIcon || '',
                    type: 'boolean',
                    icon
                });
            }
        }

        return settings;
    }

    saveDialogSettings = (settings, cb) => {
        if (settings) {
            settings.enabled = this.state.settings.enabled;
            if (settings.background && typeof settings.background === 'object') {
                settings.background.name = this.settingsId.replace(/[\s*?./\\]/g, '_') + '.' + settings.background.name.toLowerCase().split('.').pop();
            }
        }

        this.saveSettings(settings, newSettings => {
            if (settings.background) {
                this.props.tile.setBackgroundImage(settings.background + '?ts=' + Date.now(), true);
            } else {
                this.props.tile.setBackgroundImage('', false);
            }
            cb && cb(newSettings);
        });
    }

    showSettings = () =>
        this.setState({ showSettings: true });

    onSettingsClose = () =>
        this.setState({ showSettings: false });

    getAdditionalName() {
        return null;
    }

    // following function used
    //  getStateText
    //  getIcon
    //  getFirstName
    //  getAdditionalName
    //
    getStandardContent(stateId, noPointerEvents, noStyle = false) {
        let styleState;
        let styleName;
        let styleText;
        if (this.width === 2) {
            styleText = Object.assign({}, Theme.tile.tileText2);
            styleName = Object.assign({}, Theme.tile.tileName2, this.state.nameStyle || {});
            styleState = this.getStateText ? Object.assign(
                {},
                Theme.tile.tileState2,
                stateId ? (this.state[stateId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff) : {}
            ) : null;
        } else {
            styleText = Object.assign({}, Theme.tile.tileText);
            styleName = Object.assign({}, Theme.tile.tileName, this.state.nameStyle || {});
            styleState = this.getStateText ? Object.assign(
                {},
                Theme.tile.tileState,
                stateId ? (this.state[stateId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff) : {}
            ) : null;
            if (this.state.settings.background) {
                styleName.marginTop = 4;
            }
        }

        if (this.state.settings.background) {
            styleText.color = 'black';
            styleText.background = 'rgba(255,255,255,0.7)';
        }

        if (noStyle) {
            return ({
                name: this.getFirstName ? this.getFirstName() : this.state.settings.name,
                state: this.getStateText ? this.getStateText() : null
            });
        }

        return [
            this.getIcon ? (<div key={this.key + 'tile-icon'} style={noPointerEvents ? { pointerEvents: 'none' } : {}}>{this.getIcon()}</div>) : null,
            (<div key={this.key + 'tile-text'} style={styleText}>
                <div style={styleName}>{this.getFirstName ? this.getFirstName() : this.state.settings.name}{this.getAdditionalName()}</div>
                {this.getStateText ? (<div style={styleState}>{this.getStateText()}</div>) : null}
            </div>)
        ];
    }

    static renderIcon = (icon, loading, active, onClick = () => {
    }, color = '') => {
        return <div onClick={onClick} className={clsx(cls.iconWrapper, loading && cls.iconWrapperLoading)}>
            <div className={clsx(cls.styleIcon, loading && cls.styleIconLoading, active && cls.styleIconActive)}>
                {icon}
            </div>
        </div>
    }

    wrapContent(content) {
        if (this.state.editMode) {
            return [
                <div key={this.key + 'type'} style={{ display: 'none' }}>{this.channelInfo.type}</div>,
                <div key={this.key + 'wrapper'} className={cls.displayFlex}>
                    {this.state.settings.enabled ?
                        <div className={cls.wrapperEdit}>
                            <div onClick={this.toggleEnabled} key={this.key + 'icon-check'}
                                // style={Theme.tile.editMode.checkIcon} className="edit-buttons"
                                className={cls.wrapperIcon}
                            >
                                <IconCheck className={cls.iconEditStyle} />
                            </div>
                            <div onClick={this.showSettings} key={this.key + 'icon-edit'}
                                // style={Theme.tile.editMode.editIcon} className="edit-buttons"
                                className={cls.wrapperIcon}
                            >
                                <IconEdit className={cls.iconEditStyle} />
                            </div>
                        </div>
                        :
                        <div className={cls.wrapperEditNone}>
                            <div onClick={this.toggleEnabled}
                                className={cls.wrapperIcon}
                            >
                                <IconUncheck className={cls.iconEditStyle} />
                            </div>
                        </div>
                    }
                    <div className={cls.blurEdit}>
                        {content}
                    </div>
                </div>,
                this.state.showSettings ?
                    <Dialog key={this.key + 'settings'}
                        windowWidth={this.props.windowWidth}
                        name={this.state.settings.name}
                        dialogKey={this.key + 'settings'}
                        settings={this.getDialogSettings()}
                        objects={this.props.objects}
                        settingsId={this.settingsId}
                        onSave={this.saveDialogSettings}
                        onClose={this.onSettingsClose}
                    /> : null];
        } else if (this.state.settings.enabled) {
            return [
                <div key={this.key + 'type'} style={{ display: 'none' }}>{this.channelInfo.type}</div>,
                <div key={this.key + 'wrapper'} className={cls.displayFlex}>
                    {this.showCorner ? (<div
                        key={this.key + 'corner'}
                        onMouseDown={this.onLongClick}
                        className={cls.corner}
                    />) : null}
                    {this.showCornerBottom ? (<div
                        key={this.key + 'corner'}
                        onMouseDown={this.onLongClickBottom}
                        className={cls.cornerBottom}
                    />) : null}
                    {this.getIndicators()}
                    {content}
                </div>
            ];
        } else {
            return null;
        }
    }

    static getNameFontSize(name) {
        return name && name.length >= 15 ? 12 : (name && name.length > 10 ? 14 : 16);
    }

    readHistory = async id => {
        const now = new Date();
        now.setHours(now.getHours() - 24);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        let start = now.getTime();
        let end = Date.now();

        const options = {
            instance: this.props.systemConfig?.common?.defaultHistory || 'history.0',
            start,
            end,
            step: 1800000,
            from: false,
            ack: false,
            q: false,
            addID: false,
            aggregate: 'minmax'
        };

        return this.props.socket.getHistory(id || this.id, options)
            .then(values => {
                // merge range and chart
                let chart = [];
                let r = 0;
                let range = this.rangeValues;
                // let minY = null;
                // let maxY = null;

                for (let t = 0; t < values.length; t++) {
                    if (range) {
                        while (r < range.length && range[r].ts < values[t].ts) {
                            chart.push(range[r]);
                            // console.log(`add ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                            r++;
                        }
                    }
                    // if range and details are not equal
                    if (!chart.length || chart[chart.length - 1].ts < values[t].ts) {
                        chart.push(values[t]);
                        // console.log(`add value ${new Date(values[t].ts).toISOString()}: ${values[t].val}`)
                    }
                }

                if (range) {
                    while (r < range.length) {
                        chart.push(range[r]);
                        console.log(`add range ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                        r++;
                    }
                }

                // sort
                chart.sort((a, b) => a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0));
                this.echartsReact.current?.getEchartsInstance().setOption({
                    series: [{
                        data: this.convertData(chart)
                    }],
                    xAxis: {
                        data: this.convertData(chart)
                    }
                });
            })
            .catch(e =>
                console.error('Cannot read history: ' + e)
            );
    }

    convertData = (values) => {
        return values.map(e => e.val !== null ? e.val : 0);
    }

    checkHistory = (idOrData, showCornerBottom = false) => {
        let bool = true;
        if (!idOrData) {
            bool = false;
        }
        if (typeof idOrData === 'string') {
            if (!this.props.allObjects[idOrData]) {
                bool = false;
            }
            if (!this.props.allObjects[idOrData]?.common?.custom) {
                bool = false;
            }
            if (this.props.allObjects[idOrData]?.common?.custom && !this.props.allObjects[idOrData]?.common?.custom[this.props.systemConfig?.common?.defaultHistory || 'history.0']) {
                bool = false;
            }
        }
        if (showCornerBottom) {
            this.showCornerBottom = bool;
        }
        return bool;
    }

    checkCornerTop = (condition, showCorner = false) => {
        let bool = true;
        if (!condition) {
            bool = false;
        }
        if (showCorner) {
            this.showCorner = bool;
        }
        return bool;
    }

    getAllIds = (all = false) => {
        if (this.channelInfo.states.length && !all) {
            return this.channelInfo.states.filter(el => el.id).map(el => el.id);
        } else if (this.subscribes.length && all) {
            return this.subscribes;
        }
        return [];
    }

    getIdHistorys = (ids, showCornerBottom) => {
        if (!ids || !ids.length) {
            return [];
        }
        let array = [];
        ids.forEach(id => {
            if (this.checkHistory(id)) {
                array.push(id);
            }
        });
        if (showCornerBottom && !array.length) {
            this.showCornerBottom = false;
        }
        return array;
    }

    getReadHistoryData = (idOrData, callBack) => {
        if (!this.checkHistory(idOrData)) {
            callBack([]);
            return null;
        }
        this.readHistoryData(idOrData, callBack);
    }

    readHistoryData = async (id, callBack = () => { }) => {
        const now = new Date();
        now.setHours(now.getHours() - 24);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        let start = now.getTime();
        let end = Date.now();

        const options = {
            instance: this.props.systemConfig?.common?.defaultHistory || 'history.0',
            start,
            end,
            step: 60000,
            from: false,
            ack: false,
            q: false,
            addID: false,
            aggregate: 'minmax'
        };

        return this.props.socket.getHistory(id || this.id, options)
            .then(values => {
                let chart = [];
                let r = 0;
                let range = this.rangeValues;

                for (let t = 0; t < values.length; t++) {
                    if (range) {
                        while (r < range.length && range[r].ts < values[t].ts) {
                            chart.push(range[r]);
                            r++;
                        }
                    }
                    if (!chart.length || chart[chart.length - 1].ts < values[t].ts) {
                        chart.push(values[t]);
                    }
                }

                if (range) {
                    while (r < range.length) {
                        chart.push(range[r]);
                        console.log(`add range ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                        r++;
                    }
                }

                // sort
                chart.sort((a, b) => a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0));
                callBack(this.convertData(chart));
            })
            .catch(e => {
                console.error('Cannot read history: ' + e);
            })
    }

    getChartId() {
        return this.id;
    }

    getCharts = (idOrData = this.getChartId(), className, showCornerBottom = true) => {
        if (!this.checkHistory(idOrData, showCornerBottom)) {
            return null;
        }
        if (!this.firstGetCharts) {
            this.firstGetCharts = true;
            if (typeof idOrData === 'string') {
                this.readHistory(idOrData);
            }
        }
        if (!this.expireInSecInterval && typeof idOrData === 'string') {
            this.expireInSecInterval = setInterval(() => {
                this.readHistory(idOrData);
                this.expireInSecInterval = null;
            }, 60000);
        }

        const style = {
            color: '#f85e27',
            areaStyle: '#f85e276b',
        }
        if (this.props.themeName === 'dark') {
            style.color = '#f85e27';
            style.areaStyle = '#f85e276b';
        } else if (this.props.themeName === 'blue') {
            style.color = '#3399CC';
            style.areaStyle = '#3399cc24';
        } else if (this.props.themeName === 'colored') {
            style.color = '#194040';
            style.areaStyle = '#1940406b';
        } else if (this.props.themeName === 'light') {
            style.color = '#020202';
            style.areaStyle = '#0202026b';
        }

        const option = {
            animation: true,
            legend: {
                show: false,
            },
            grid: {
                show: false,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            xAxis:
            {
                show: false,
                boundaryGap: false,
                data: typeof idOrData === 'string' ? [] : idOrData
            },
            yAxis: {
                show: false,
                type: 'value'
            },
            series: [
                {
                    silent: true,
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    color: style.color,
                    areaStyle: { color: style.areaStyle },
                    data: typeof idOrData === 'string' ? [] : idOrData
                }
            ]
        };

        return <div className={cls.wrapperCharts}>
            <ReactEchartsCore
                className={clsx(cls.styleCharts, className)}
                ref={this.echartsReact}
                echarts={echarts}
                option={option}
                notMerge={true}
                lazyUpdate={true}
                //theme={ this.props.themeType === 'dark' ? 'dark' : '' }
                //style={{ height: this.state.chartHeight + 'px', width: '100%' }}
                opts={{ renderer: 'svg' }}
            />
        </div>;
    }

    render() {
        if (!this.state.editMode && !this.state.settings.enabled) {
            return null;
        } else {
            return this.wrapContent(this.state.settings.name || this.getObjectNameCh());
        }
    }
}

export default SmartGeneric;

