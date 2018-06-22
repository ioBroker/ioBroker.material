import React, {Component} from 'react';
import SmartGeneric from './SmartGeneric';
import IconThermometer from '../icons/Thermometer';
import IconHydro from '../icons/Humidity';
import IconInfo from 'react-icons/lib/md/info';

import Theme from '../theme';
import I18n from '../i18n';
import DialogInfo from "./SmartDialogInfo";

class SmartInfo extends SmartGeneric {
    constructor(props) {
        super(props);
        this.stateRx.showDialog = false;
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
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
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
            this.infos = infoIDs.map(id => SmartInfo.getObjectAttributes(this.props.objects, id));
        }

        // make tile with opacity 1
        this.props.tile.state.state = true;

        this.props.tile.setState({
            isPointer: (this.infos && this.infos.length > 2)
        });

        this.props.tile.registerHandler('onMouseDown', this.onTileMouseDown.bind(this));
        this.onMouseUpBind = this.onMouseUp.bind(this);
        this.componentReady();
    }

    static getObjectAttributes(objects, id) {
        if (!objects[id] || !objects[id].common) return null;
        const role = objects[id].common.role || '';
        const unit = objects[id].common.unit || '';
        let title = objects[id].common.name || id.split('.').pop();
        if (typeof title === 'object') {
            title = title[I18n.getLanguage()] || title.en || id.split('.').pop();
        }
        title = title.replace(/_/g, ' ');
        title = title[0].toUpperCase() + title.substring(1).toLowerCase();

        if (role.match(/humidity/i)) {
            return {
                id: id,
                icon: IconHydro,
                iconStyle: {color: '#0056c3'},
                unit: unit ? ' ' + unit : ' %',
                name: title
            }
        } else if (role.match(/temperature/i)) {
            return {
                id: id,
                icon: IconThermometer,
                iconStyle: {color: '#e54100'},
                unit: unit ? ' ' + unit : '°',
                name: title
            }
        } else {
            return {
                id: id,
                unit: unit ? ' ' + unit : '',
                name: title
            }
        }
    }

    updateState(id, state) {
        if (this.infos && this.infos.find(e => e.id === id)) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        let Icon = this.infos[0].icon || IconInfo;
        return (
            <div key={this.id + '.icon'} style={Object.assign({}, Theme.tile.tileIcon, this.infos[0].iconStyle || {})} className="tile-icon">
                <Icon style={{zIndex: 1}} width={'100%'} height={'100%'}/>
            </div>
        );
    }

    getStateText() {
        const state = this.state[this.id];
        return state === undefined || state === null ? '?' : state + this.infos[0].unit;
    }

    getSecondaryDiv() {
        if (!this.infos || !this.infos[1] || !this.infos[1].id || this.state[this.infos[1].id] === undefined || this.state[this.infos[1].id] === null) {
            return null;
        }
        let val = this.state[this.infos[1].id];
        const Icon = this.infos[1].icon;
        return (<div key={this.id + '.tile-secondary'} className="tile-text-second" style={Theme.tile.secondary.div} title={this.secondary.title}>
            {Icon ? (<Icon style={Object.assign({}, Theme.tile.secondary.icon, this.infos[1].iconStyle || {})} />) : null}
            <span style={Theme.tile.secondary.text}>{val + this.infos[1].unit}</span>
        </div>);
    }
    getNumberOfValuesIndicator() {
        if (this.infos.length <= 2) return null;
        return (<div style={Theme.tile.tileNumber} title={I18n.t('Show %s values', this.infos.length)}>{this.infos.length}</div>);
    }
    onDialogClose() {
        this.setState({showDialog: false});
    }

    onTileMouseDown(e) {
        if (this.state.showDialog) return;
        e.preventDefault();
        e.stopPropagation();
        document.addEventListener('mouseup',    this.onMouseUpBind,     {passive: false, capture: true});
        document.addEventListener('touchend',   this.onMouseUpBind,     {passive: false, capture: true});
        this.timer = setTimeout(this.onLongClick.bind(this), 500);
    }

    onMouseUp() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        document.removeEventListener('mouseup',     this.onMouseUpBind,     {passive: false, capture: true});
        document.removeEventListener('touchend',    this.onMouseUpBind,     {passive: false, capture: true});
    }

    onLongClick() {
        this.timer = null;
        this.setState({showDialog: true});
    }

    render() {
        return this.wrapContent([
            (<div key={this.id + '.tile-icon'} className="tile-icon">{this.getIcon()}</div>),
            this.getSecondaryDiv(),
            this.getNumberOfValuesIndicator(),
            (<div key={this.id + '.tile-text'} className="tile-text" style={Theme.tile.tileText}>
                <div className="tile-channel-name" style={Object.assign({}, Theme.tile.tileName, this.nameStyle)}>{this.name}</div>
                <div className="tile-state-text"  style={Object.assign({}, Theme.tile.tileState, this.state[this.actualId] ? Theme.tile.tileStateOn : Theme.tile.tileStateOff, {fontSize: 18})}>{this.getStateText()}</div>
            </div>),
            this.state.showDialog ?
                <DialogInfo key={this.id + '.dialog'}
                            points={this.infos}
                            //onValueChange={this.onValueChange.bind(this)}
                            onClose={this.onDialogClose.bind(this)}
                            objects={this.props.objects}
                            states={this.props.states}
                /> : null
        ]);
    }
}

export default SmartInfo;

