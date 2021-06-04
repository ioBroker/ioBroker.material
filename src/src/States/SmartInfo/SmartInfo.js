/**
 * Copyright 2018-2020 bluefox <dogafox@gmail.com>
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
import React from 'react';
import SmartGeneric from '../SmartGeneric';
import IconThermometer from '../../icons/ThermometerSimple';
import IconHydro from '../../icons/Humidity';
import {MdInfo as IconInfo} from 'react-icons/md';
import Utils from '@iobroker/adapter-react/Components/Utils';

import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';
import Dialog from '../../Dialogs/SmartDialogInfo';
import PropTypes from 'prop-types';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsx from 'clsx/dist/clsx';

const invisibleDefaultRoles = [
    /^timer.off$/,
    /^inhibit$/,
];

class SmartInfo extends SmartGeneric {
    // expected:
    static propTypes = {
        tile:               PropTypes.object.isRequired,
        objects:            PropTypes.object.isRequired,
        states:             PropTypes.object.isRequired,
        onCollectIds:       PropTypes.func,
        onControl:          PropTypes.func
    };

    constructor(props) {
        super(props);
        let hasControls = false;
        if (this.channelInfo.states) {
            let infoIDs = this.channelInfo.states.filter(state => state.id && state.name === 'ACTUAL').map(state => state.id);
            // place numbers first
            if (infoIDs.length > 1) {
                infoIDs.sort((a, b) => {
                    const objA = this.props.objects[a];
                    const objB = this.props.objects[b];
                    const typeA = objA && objA.common && objA.common.type;
                    const typeB = objB && objB.common && objB.common.type;
                    if (typeA && !typeB) return 1;
                    if (!typeA && typeB) return -1;
                    if (typeA === 'number' && typeB !== 'number') return -1;
                    if (typeA !== 'number' && typeB === 'number') return 1;
                    return 0;
                });
            }
            if (infoIDs[0]) {
                this.id = infoIDs[0];
            } else {
                this.id = '';
            }

            if (infoIDs[1]) {
                this.secondary  = {
                    id: infoIDs[1]
                };
            }
            const name = this.getObjectNameCh();
            this.infos = infoIDs.map(id => SmartInfo.getObjectAttributes(this.props.objects, id, name));
            hasControls = !!this.infos.find(item => item.common && item.common.write);
        }

        if (!this.infos.find(state => !invisibleDefaultRoles.find(test => !test.test(state.role)))) {
            this.defaultEnabling = false;
        }

        // make tile with opacity 1
        this.props.tile.state.state = true;

        if (this.infos && (this.infos.length > 2 || hasControls)) {
            this.stateRx.showDialog = false; // support dialog in this tile (used in generic class)
        }

        this.props.tile.setState({
            isPointer: this.showCorner
        });

        this.key = 'smart-info-' + this.id + '-';

        this.componentReady();
    }

    static getObjectAttributes(objects, id, channelName) {
        if (!id || !objects[id] || !objects[id].common) return null;
        const role = objects[id].common.role || '';
        const unit = objects[id].common.unit || '';
        let  title = objects[id].common.name || id.split('.').pop();
        if (!title) {
            title = id.split('.').pop();
        }
        if (typeof title === 'object') {
            title = title[I18n.getLanguage()] || title.en || id.split('.').pop();
        }

        title = title.replace(/[._]/g, ' ').trim();
        if (title.toUpperCase() !== channelName.toUpperCase()) {
            title = title.replace(channelName, '').trim();
        }

        title = Utils.splitCamelCase(title);

        if (role.match(/humidity/i)) {
            return {
                id: id,
                icon: IconHydro,
                iconStyle: {color: '#0056c3'},
                unit: unit ? ' ' + unit : ' %',
                role: role,
                name: title,
                common: objects[id].common
            }
        } else if (role.match(/temperature/i)) {
            return {
                id: id,
                icon: IconThermometer,
                iconStyle: {color: '#e54100'},
                unit: unit ? ' ' + unit : '°',
                name: title,
                role: role,
                common: objects[id].common
            }
        } else {
            return {
                id: id,
                unit: unit ? ' ' + unit : '',
                icon: Utils.getObjectIcon(id, objects[id]),
                name: title,
                role: role,
                common: objects[id].common
            }
        }
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        if (this.infos && this.infos.find(e => e.id === id)) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        let customIcon;
        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter src={this.getDefaultIcon()} alt=" " style={{height: '100%', zIndex: 1}}/>);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter src={this.state.settings.icon} alt=" " style={{height: '100%', zIndex: 1}}/>);
            } else {
                const Icon = this.infos[0].icon || IconInfo;
                customIcon = (<Icon className={cls.iconStyle}/>);
            }
        }

        return (
            <div key={this.key + 'icon'} className={cls.iconWrapper}>
                {customIcon}
            </div>
        );
    }

    getStateText() {
        const state = this.state[this.id];
        return <div className={clsx(state === undefined || state === null ?cls.textOff:cls.textOn)}>{state === undefined || state === null ? '?' : state + this.infos[0].unit}</div>;
    }

    getSecondaryDiv() {
        if (!this.infos || !this.infos[1] || !this.infos[1].id || this.state[this.infos[1].id] === undefined || this.state[this.infos[1].id] === null) {
            return null;
        }
        let val = this.state[this.infos[1].id];
        const icon = this.infos[1].icon;
        let Icon;
        if (icon) {
            if (typeof icon === 'object') {
                Icon = icon;
                Icon = (<Icon style={Object.assign({}, Theme.tile.secondary.icon, this.infos[1].iconStyle || {})} />);
            } else {
                Icon = (<img alt={' '} src={icon} style={Object.assign({}, Theme.tile.secondary.icon, this.infos[1].iconStyle || {})}/>)
            }
        }

        return (<div key={this.key + 'tile-secondary'} className="tile-text-second" style={Theme.tile.secondary.div} title={this.infos[1].name}>
            {Icon}
            <span style={Theme.tile.secondary.text}>{val + this.infos[1].unit}</span>
        </div>);
    }

    getNumberOfValuesIndicator() {
        if (this.infos.length <= 2) return null;
        return (<div key={this.key + 'tile-number'} style={Theme.tile.tileNumber} title={I18n.t('Show %s values', this.infos.length)}>{this.infos.length}</div>);
    }

    getFirstName() {
        this.firstName = this.firstName || I18n.t(Utils.CapitalWords(this.id.split('.').pop()));

        return [(<span key={this.key + 'tile-name'}>{this.state.settings.name} </span>),(<span key={this.key + 'tile-first-name'} style={Theme.tile.tileNameSmall}>{this.firstName}</span>)];
    }

    setValue = (id, value) => {
        console.log('Control ' + id + ' = ' + value);
        this.props.onControl(id, value);
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.actualId),
            this.getSecondaryDiv(),
            this.getNumberOfValuesIndicator(),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                        dialogKey={this.key + 'dialog'}
                        windowWidth={this.props.windowWidth}
                        points={this.infos}
                        onCollectIds={this.props.onCollectIds}
                        name={this.state.settings.name}
                        onValueChange={this.setValue}
                        onClose={this.onDialogClose}
                        objects={this.props.objects}
                        states={this.props.states}
                /> : null
        ]);
    }
}

export default SmartInfo;

