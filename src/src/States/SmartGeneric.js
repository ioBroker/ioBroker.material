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
import Utils from '../Utils';
import I18n from '../i18n';
import Theme from '../theme';
import IconCheck from 'react-icons/lib/md/visibility';
import IconRemoved from 'react-icons/lib/md/remove';
import IconEdit from 'react-icons/lib/md/edit';
import IconDirectionUp from 'react-icons/lib/md/arrow-upward';
import IconDirectionDown from 'react-icons/lib/md/arrow-downward';
import IconDirection from 'react-icons/lib/md/swap-vert';
import Dialog from '../Dialogs/SmartDialogSettings';

class SmartGeneric extends Component {
    static propTypes = {
        objects:            PropTypes.object.isRequired,
        states:             PropTypes.object.isRequired,
        tile:               PropTypes.object.isRequired,
        channelInfo:        PropTypes.object.isRequired,
        ignoreIndicators:   PropTypes.array,
        enumNames:          PropTypes.array,
        windowWidth:        PropTypes.number,
        user:               PropTypes.string
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
            backgroundId: 0,
            executing: false,
            settings: {},
            showSettings: false,
            editMode: null,
            ignoreIndicators: this.props.ignoreIndicators || []
        };
        this.defaultEnabling = true; // overload this property to hide element by default

        this.editMode = this.props.editMode;

        this.lastEnabledChange = 0;

        if (typeof noSubscribe !== 'boolean' || !noSubscribe) {
            if (this.channelInfo.states) {
                let ids = [];
                this.channelInfo.states.forEach(function (state) {
                    if (!state.id) return;

                    if (state.id.startsWith('system.adapter.')) {
                        ids.push(state.id);
                    } else
                    if (!state.noSubscribe &&
                        this.props.objects[state.id] &&
                        this.props.objects[state.id].type === 'state' &&
                        ids.indexOf(state.id) === -1)
                    {
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
    }

    componentReady () {
        if (this.id && this.props.objects[this.id]) {
            this.settingsId = this.id;
        } else
        if (this.instanceId !== undefined) {
            this.settingsId = this.instanceId;
        }

        if (this.stateRx.showDialog !== undefined) {
            this.showCorner = true;
            this.onMouseUpBind = this.onMouseUp.bind(this);
            this.props.tile.registerHandler('onMouseDown', this.onTileMouseDown.bind(this));
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

        this.stateRx.nameStyle = {fontSize: SmartGeneric.getNameFontSize(this.stateRx.settings.name)};

        this.props.tile.setVisibility(this.stateRx.settings.enabled);

        this.props.tile.setColorOn(this.stateRx.settings.colorOn   || Theme.tile.tileOn.background);
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

    componentDidMount () {
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
                name = Utils.getObjectName(objects, id, null, {language: I18n.getLanguage()});

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
        if (this.indicators && id === this.indicators.directionId) {
            val = (state.val !== null && state.val !== undefined) ? state.val.toString() : '';
        } else if (this.indicators && id === this.indicators.errorId) {
            if (typeof state.val === 'string' ) {
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
                } else if (obj.common.states && obj.common.states[val] !== undefined)  {
                    this.errorText = I18n.t(obj.common.states[val]);
                    val = true;
                }
            }
        } else {
            val = typeof state.val === 'number' ? !!state.val : state.val === true || state.val === 'true' || state.val === '1' || state.val === 'on' || state.val === 'ON';
        }
        const newState = {};
        newState[id] = val;
        this.setState(newState);
    }

    // default handler
    onControl(id, val) {

    }

    // default handler
    onLongClick(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.setState({showDialog: true});
    }

    onDialogClose() {
        this.setState({showDialog: false});
    }

    onMouseUp() {
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.onToggleValue && this.onToggleValue();
        }
    }

    onTileMouseDown(e) {
        if (this.state.showDialog) return;
        //e.preventDefault();
        e.stopPropagation();

        this.timer = setTimeout(this.onLongClick.bind(this), 500);

        document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
        document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
    }

    componentWillUnmount() {
        if (this.props.onCollectIds && this.subscribed) {
            this.props.onCollectIds(this, this.subscribes, false);
            this.subscribed = null;
        }
    }

    saveSettings(newSettings, cb) {
        const settings = newSettings || this.state.settings;
        if (this.props.onSaveSettings && this.settingsId) {
            this.props.onSaveSettings(this.settingsId, settings, {enabled: this.defaultEnabling}, () => {
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

                this.props.tile.setColorOn(settings.colorOn   || Theme.tile.tileOn);
                this.props.tile.setColorOff(settings.colorOff || Theme.tile.tileOff);
                this.props.tile.setVisibility(settings.enabled);
                this.width = settings.doubleSize ? 2 : 1;
                this.props.tile.setSize(this.width);
                cb && cb(settings);
            });
        } else if (this.customSettings) {
            // custom URL
            const enumSettings = Utils.getSettings(this.props.objects[this.customSettings.settingsId], {user: this.props.user});
            let pos = -1;

            if (enumSettings) {
                enumSettings.URLs.forEach((e, i) => {
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

    toggleEnabled() {
        let settings = JSON.parse(JSON.stringify(this.state.settings));
        settings.enabled = !settings.enabled;

        this.saveSettings(settings, () => this.setState({settings}));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.editMode !== this.state.editMode) {
            this.setState({editMode: nextProps.editMode});
            //this.props.tile.setVisibility(nextProps.editMode || this.state.settings.enabled);
        }
        if (JSON.stringify(nextProps.ignoreIndicators) !== JSON.stringify(this.state.ignoreIndicators)) {
            this.setState({ignoreIndicators: nextProps.ignoreIndicators});
        }
    }

    roundValue(value, decimals) {
        if (decimals !== undefined || typeof this.state.settings.decimals !== 'undefined') {
            return value.toFixed(decimals !== undefined ? decimals : this.state.settings.decimals);
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
        this.channelInfo.states.forEach(state =>  {
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

                result.push((<Icon
                    key={that.key + 'indicator-' + state.name.toLowerCase()}
                    className={'indicator-' + state.name.toLowerCase()}
                    style={Object.assign({}, Theme.tile.tileIndicator, {color: state.color})}
                />));
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

        settings.unshift({
            name: 'doubleSize',
            value: this.state.settings.doubleSize || '',
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

    saveDialogSettings(settings, cb) {
        if (settings) {
            settings.enabled = this.state.settings.enabled;
            if (settings.background && typeof settings.background === 'object') {
                settings.background.name = this.settingsId.replace(/[\s*?./\\]/g, '_') + '.' + settings.background.name.toLowerCase().split('.').pop();
            }
        }

        this.saveSettings(settings, newSettings => {
            if (settings.background) {
                this.state.backgroundId++;
                this.props.tile.setBackgroundImage(settings.background + '?ts=' + Date.now(), true);
            } else {
                this.props.tile.setBackgroundImage('', false);
            }
            cb && cb(newSettings);
        });
    }

    showSettings() {
        this.setState({showSettings: true});
    }

    onSettingsClose() {
        this.setState({showSettings: false});
    }

    getAdditionalName() {
        return null;
    }

    // following function used
    //  getStateText
    //  getIcon
    //  getFirstName
    //  getAdditionalName
    //
    getStandardContent(stateId, noPointerEvents) {
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

        return [
            this.getIcon ? (<div key={this.key + 'tile-icon'} style={noPointerEvents ? {pointerEvents: 'none'} : {}}>{this.getIcon()}</div>): null,
            (<div key={this.key + 'tile-text'} style={styleText}>
                <div style={styleName}>{this.getFirstName ? this.getFirstName() : this.state.settings.name}{this.getAdditionalName()}</div>
                {this.getStateText ? (<div style={styleState}>{this.getStateText()}</div>) : null}
            </div>)
        ];
    }

    wrapContent(content) {
        if (this.state.editMode) {
            return [
                (<div key={this.key + 'type'} style={{display: 'none'}}>{this.channelInfo.type}</div>),
                (<div key={this.key + 'wrapper'}>
                    {this.state.settings.enabled ?
                        [(<div onClick={this.toggleEnabled.bind(this)} key={this.key + 'icon-check'} style={Theme.tile.editMode.checkIcon} className="edit-buttons">
                                <IconCheck width={'90%'} height={'50%'} style={Theme.tile.editMode.buttonIcon}/>
                        </div>),
                        (<div onClick={this.showSettings.bind(this)} key={this.key + 'icon-edit'} style={Theme.tile.editMode.editIcon} className="edit-buttons">
                            <IconEdit width={'100%'} height={'50%'} style={Object.assign({}, Theme.tile.editMode.buttonIcon, {width: '80%', marginLeft: '20%'})}/>
                            </div>
                        )]
                        :
                        (<div onClick={this.toggleEnabled.bind(this)} key={this.key + '.icon-check'} style={Theme.tile.editMode.removeIcon}>
                            <IconRemoved width={'100%'} height={'100%'} style={Theme.tile.editMode.buttonIconRemoved}/>
                        </div>)
                    }
                    {content}
                </div>),
                this.state.showSettings ? (
                    <Dialog key={this.key + 'settings'}
                         windowWidth={this.props.windowWidth}
                         name={this.state.settings.name}
                         dialogKey={this.key + 'settings'}
                         settings={this.getDialogSettings()}
                         objects={this.props.objects}
                         settingsId={this.settingsId}
                         onSave={this.saveDialogSettings.bind(this)}
                         onClose={this.onSettingsClose.bind(this)}
                />): null];
        } else if (this.state.settings.enabled) {
            return [
                (<div key={this.key + 'type'} style={{display: 'none'}}>{this.channelInfo.type}</div>),
                (<div key={this.key + 'wrapper'} >
                    {this.showCorner ? (<div key={this.key + 'corner'} onMouseDown={this.onLongClick.bind(this)} className="corner" style={Theme.tile.tileCorner}/>) : null}
                    {this.getIndicators()}
                    {content}
                </div>)
            ];
        } else {
            return null;
        }
    }

    static getNameFontSize(name) {
        return name && name.length >= 15 ? 12 : (name && name.length > 10 ? 14 : 16);
    }

    render() {
        if (!this.state.editMode && !this.state.settings.enabled) {
            return null;
        } else {
            return this.wrapContent(this.settings.name || this.getObjectNameCh());
        }
    }
}

export default SmartGeneric;

