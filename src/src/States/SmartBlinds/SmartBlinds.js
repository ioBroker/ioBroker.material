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
import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SmartGeneric from '../SmartGeneric';
import Icon from '../../icons/Jalousie'
import Theme from '../../theme';
import Dialog from '../../Dialogs/SmartDialogSlider';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx';

const styles = {
    overlap: {
        zIndex: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        opacity: 0.8,
        background: '#FFF',
        width: '100%'
    }
};

class SmartBlinds extends SmartGeneric {
    // props = {
    //    objects: OBJECT
    //    tile: parentDiv
    //    states: STATES
    //    onControl: function
    // };

    constructor(props) {
        super(props);

        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'SET');
            if (state && this.props.objects[state.id] && this.props.objects[state.id].common) {
                this.id = state.id;
            } else {
                this.id = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            this.actualId = state ? state.id : this.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STOP');
            this.stopId = state && state.id;
        }

        if (this.id) {
            this.max = this.props.objects[this.actualId].common.max;
            if (this.max === undefined) {
                this.max = 100;
            }
            this.max = parseFloat(this.max);

            this.min = this.props.objects[this.actualId].common.min;
            if (this.min === undefined) {
                this.min = 0;
            }
            this.min = parseFloat(this.min);

        }
        this.props.tile.setState({ state: true });

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)
        this.stateRx.setValue = null;
        this.key = 'smart-blinds-' + this.id + '-';
        this.noAck = true;  // used in generic
        this.doubleState = true; // used in generic: If colors for on and for off

        this.componentReady();
        if (this.state.settings.toggleOnClick) {
            this.props.tile.setState({ isPointer: true });
        }
    }

    realValueToPercent(val) {
        if (val === undefined) {
            if (this.props.states[this.actualId]) {
                val = this.props.states[this.actualId].val || 0;
            } else {
                val = 0;
            }
        }
        val = parseFloat(val);
        val = Math.round((val - this.min) / (this.max - this.min) * 100);
        if (this.state.settings.inverted) {
            val = 100 - val;
        }
        return val;
    }

    percentToRealValue(percent) {
        percent = parseFloat(percent);
        if (this.state.settings.inverted) {
            percent = 100 - percent;
        }
        return Math.round((this.max - this.min) * percent / 100);
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        let newState = {};
        const val = typeof state.val === 'number' ? state.val : parseFloat(state.val);
        if (this.actualId === id || (this.id === id && this.id === this.actualId && state.ack)) {
            if (!isNaN(val)) {
                newState[id] = val;
                this.setState(newState);
            } else {
                newState[id] = null;
                this.setState(newState);

            }

            // hide desired value
            if (this.state.setValue === newState[id] && state.ack) {
                this.setState({ setValue: null });
            }

            if (state.ack && this.state.executing) {
                this.setState({ executing: false });
            }
        } else if (id === this.id) {
            newState[id] = val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    setValue = percent => {
        console.log('Control ' + this.id + ' = ' + this.percentToRealValue(percent));
        this.setState({ executing: !this.state.settings.noAck, setValue: percent });
        this.props.onControl(this.id, this.percentToRealValue(percent));
    }

    onStop = () => {
        this.setState({ executing: false });
        this.stopId && this.props.onControl && this.props.onControl(this.stopId, true);
    }

    onToggleValue() {
        if (this.state.settings.toggleOnClick) {
            let newValue;
            const percent = this.realValueToPercent();
            if (percent) {
                newValue = 0;
            } else {
                newValue = 100;
            }
            this.setValue(newValue);
        }
    }

    getIcon() {
        let customIcon;
        if (this.state.settings.useDefaultIcon) {
            customIcon = <IconAdapter src={this.getDefaultIcon()} alt="icon" style={{ height: '100%', zIndex: 1 }} />;
        } else {
            if (this.state.settings.icon) {
                customIcon = <IconAdapter src={this.state.settings.icon} alt="icon" style={{ height: '100%', zIndex: 1 }} />;
            } else {
                customIcon = <Icon className={clsx(clsGeneric.iconStyle, this.state[this.actualId] !== this.min && clsGeneric.activeIconStyle)} />;
            }
        }

        // const overlapStyle = Object.assign({}, styles.overlap, {height: this.realValueToPercent(this.state[this.id]) + '%'});
        // if (this.state.settings.colorOn) {
        //     Object.assign(overlapStyle, {background: this.state.settings.colorOn});
        // }

        // return <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, /*this.state[this.actualId] !== this.min ? {color: Theme.palette.lampOn} : */{}, {left: '1rem'})} className="tile-icon">
        //     {customIcon}
        //     {this.state.executing ? <CircularProgress style={{zIndex: 3, position: 'absolute', top: 0, left: 0}} size={Theme.tile.tileIcon.width}/> : null}
        //     <div style={overlapStyle} />
        // </div>;
        return SmartGeneric.renderIcon(customIcon, this.state.executing, this.state[this.actualId] !== this.min);
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        settings.unshift({
            name: 'inverted',
            value: this.state.settings.inverted || false,
            type: 'boolean'
        });

        settings.unshift({
            name: 'toggleOnClick',
            value: this.state.settings.toggleOnClick || false,
            type: 'boolean'
        });

        return settings;
    }

    saveDialogSettings(settings) {
        this.props.tile.setState({ isPointer: settings.toggleOnClick });
        super.saveDialogSettings(settings);
    }

    getStateText() {
        if (this.state[this.actualId] === null || this.state[this.actualId] === undefined) {
            return '---';
        } else {
            if (this.workingId && this.state[this.workingId] && this.state.setValue !== null && this.state.setValue !== undefined) {
                return `${this.realValueToPercent()}% → ${this.state.setValue}%`;
            } else {
                return this.realValueToPercent() + '%';
            }
        }
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.id, true),
            this.state.showDialog ?
                <Dialog key={this.key + 'dialog'}
                    transparent
                    open={true}
                    startValue={this.realValueToPercent()}
                    onValueChange={this.setValue}
                    windowWidth={this.props.windowWidth}
                    inverted={this.state.settings.inverted}
                    onStop={this.stopId ? this.onStop : null}
                    onClose={this.onDialogClose}
                    type={Dialog.types.blinds}
                /> : null
        ]);
    }
}

export default SmartBlinds;

