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
import SmartGeneric from '../SmartGeneric';
import IconWindowOpened from '../../icons/WindowOpened';
import IconWindowClosed from '../../icons/WindowClosed';
import IconWindowTilted from '../../icons/WindowTilted';
import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';

const VALUES = {
    closed: [/close/i],
    tilted: [/tilt/i],
    opened: [/open/i]
};

class SmartWindowTilt extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }
        }
        this.values = {
            closed: 0,
            tilted: 1,
            opened: 2
        };

        if (this.id && this.props.objects[this.id] && this.props.objects[this.id].common && this.props.objects[this.id].common.states) {
            const states = this.props.objects[this.id].common.states;
            for (const val in states) {
                if (states.hasOwnProperty(val)) {
                    for (const v in VALUES) {
                        if (VALUES.hasOwnProperty(v) && VALUES[v].find(r => r.test(states[val])) !== undefined) {
                            this.values[v] = parseInt(val, 10);
                            break;
                        }
                    }
                }
            }
        }


        this.props.tile.setState({
            isPointer: false
        });
        this.key = 'smart-window-' + this.id + '-';

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        let val;
        if (!state) {
            return;
        }

        if (typeof state.val !== 'number') {
            const i = parseInt(state.val, 10);
            if (i.toString() === i) {
                val = i;
            } else if (state.val !== null && state.val !== undefined) {
                val = state.val.toString();

                for (const value in VALUES) {
                    if (VALUES.hasOwnProperty(value)) {
                        // eslint-disable-next-line no-loop-func
                        if (VALUES[value].find(r => r.test(val))) {
                            val = value;
                            break;
                        }
                    }
                }
            } else {
                state.val = 0;
            }
        } else {
            val = state.val;
        }
        if (typeof val === 'number') {
            for (const value in this.values) {
                if (this.values.hasOwnProperty(value) && this.values[value] === val) {
                    val = value;
                    break;
                }
            }
        }
        if (typeof val === 'number') {
            val = 'closed';
        }

        if (id === this.id) {
            const newState = {};
            newState[id] = val;
            this.setState(newState);

            if ((!this.props.tile.state.state && val !== 'closed') || (this.props.tile.state.state && val === 'closed')) {
                this.props.tile.setState({
                    state: val !== 'closed'
                });
            }
        } else {
            super.updateState(id, state);
        }
        if (this.hideOnFalse) {
            let someIndicator = false;
            if (this.indicators) {
                const ids = Object.keys(this.indicators).filter(_id => this.indicators[_id]);
                someIndicator = ids.find(_id => this.state[this.indicators[_id]]);
            }

            this.props.tile.setState({
                visible: this.state[this.id] || someIndicator
            });
        }
    }

    getIcon() {
        let Icon;
        switch (this.state[this.id]) {
            case 'opened':
                Icon = IconWindowOpened;
                break;

            case 'tilted':
                Icon = IconWindowTilted;
                break;

            case 'closed':
            default:
                Icon = IconWindowClosed;
                break;
        }

        const iconStyle = {
            width: 60,
            height: 60,
            top: '0.2rem',
            left: '0.2rem'
        };
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter alt="icon" src={this.getDefaultIcon()} style={{width: '100%', zIndex: 1}}/>);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter alt="icon" src={this.state.settings.icon} style={{height: '100%', zIndex: 1}}/>);
            } else {
                customIcon = (<Icon className={clsGeneric.iconStyle}/>);
            }
        }
        // return (
        //     <div key={this.key + 'icon'} style={Object.assign({}, Theme.tile.tileIcon, iconStyle)} className="tile-icon">
        //         {customIcon}
        //     </div>
        // );
        return SmartGeneric.renderIcon(customIcon);
    }

    getStateText() {
        if (this.state[this.id]){
            return I18n.t(this.state[this.id]);
        } else {
            return I18n.t('unknown');
        }
    }

    render() {
        return this.wrapContent(this.getStandardContent(this.actualId));
    }
}

export default SmartWindowTilt;

