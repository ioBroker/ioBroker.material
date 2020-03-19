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
import PropTypes from 'prop-types';
import Theme from '../theme';
import I18n from '../i18n';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import SmartDialogGeneric from './SmartDialogGeneric';
import Typography from '@material-ui/core/Typography';
import BoolControl from '../basic-controls/react-info-controls/BoolControl'
import InputControl from '../basic-controls/react-info-controls/InputControl'
import InfoControl from '../basic-controls/react-info-controls/InfoControl'

class SmartDialogInfo extends SmartDialogGeneric  {
    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string.isRequired,
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        objects:            PropTypes.object,
        states:             PropTypes.object,
        onValueChange:      PropTypes.func,
        points:             PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.props.points.forEach(e => {
            const state = this.props.states[e.id];
            if (state) {
                this.stateRx[e.id] = {val: state.val, ts: state.ts, lc: state.lc};
            } else {
                this.stateRx[e.id] = null;
            }
            this.subscribes = this.subscribes || [];
            this.subscribes.push(e.id);
        });
        this.refDialog = React.createRef();

        this.componentReady();
    }

    controlValue(id, value) {
        this.setState({toast: I18n.t('sent')});
        this.props.onValueChange && this.props.onValueChange(id, value);
    }

    handleToggle(id) {
        const newState = {};
        const state = this.state[id];
        newState[id] = {val: !(state && state.val)};
        if (state) {
            newState[id].lc = state.lc;
            newState[id].ts = state.ts;
        }
        this.setState(newState);
        this.controlValue(id, newState[id].val);
    }

    handleValue(id, value) {
        const newState = {};
        newState[id] = {val: value};
        const state = this.state[id];
        if (state) {
            newState[id].lc = state.lc;
            newState[id].ts = state.ts;
        }
        if (this.state[id].val !== newState[id].val) {
            this.setState(newState);
        }
        this.controlValue(id, value);
    }

    generateContent() {
        const result = this.props.points.map((e, i) => {
            const divider = i !== this.props.points.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null;

            let item;

            if (e.common && e.common.write) {
                if (e.common.type === 'boolean') {
                    // switch
                    if (e.common.read !== false) {
                        item = (<BoolControl
                                    key={this.props.dialogKey + '-' + e.id + '-control'}
                                    label={e.name}
                                    value={this.state[e.id]}
                                    language={I18n.getLanguage()}
                                    icon={e.icon}
                                    onChange={() => this.handleToggle(e.id)}
                                    />);
                    } else { // button: read = false, write = true
                        item = (<div key={this.props.dialogKey + '-' + e.id + '-control'}
                                     style={{width: '100%', textAlign: 'center'}}>
                                    <Button variant="contained" style={{minWidth: '50%'}} onClick={event => this.handleButton(event, e.id)}>{e.name}</Button>
                                </div>);
                    }
                } else
                if (e.common.type === 'number' && e.common.min !== undefined && e.common.max !== undefined && e.common.max - e.common.min < 5000) {
                    // slider
                    item = [
                        (<Typography key={this.props.dialogKey + '-' + e.id + '-title'}>{e.name} - {this.state[e.id] ? this.state[e.id].val : '?'}{e.unit}</Typography>),
                        (<Slider
                            classes={{}}
                            key={this.props.dialogKey + '-' + e.id + '-control'}
                            valueLabelDisplay="auto"
                            min={e.common.min}
                            max={e.common.max}
                            step={((e.common.max - e.common.min) / 100)}
                            value={this.state[e.id].val}
                            aria-labelledby={e.name}
                            style={{width: 'calc(100% - 20px)', marginLeft: 10}}
                            onChange={(event, value) => this.handleValue(e.id, value)}
                            /*label={
                                <div style={styles.labelStyleOuter}>
                                    <div style={styles.labelStyleInner}>
                                        {this.state[e.id].val}
                                    </div>
                                </div>
                            }*/
                        />)];
                } else {
                    // input field
                    item = (<InputControl
                        key={this.props.dialogKey + '-' + e.id + '-title'}
                        type={e.common && e.common.type === 'number' ? 'number' : 'text'}
                        icon={e.icon}
                        label={e.name + (e.unit ? ' (' + e.unit.trim() + ')' : '')}
                        min={e.common.min}
                        max={e.common.max}
                        value={this.state[e.id]}
                        onChange={value => this.handleValue(e.id, value)}
                    />);
                }
            } else {
                if (e.common && e.common.type === 'boolean') {
                    item = (<BoolControl
                        key={this.props.dialogKey + '-' + e.id + '-control'}
                        label={e.name}
                        value={this.state[e.id]}
                        language={I18n.getLanguage()}
                    />);
                } else {
                    item = (
                        <InfoControl
                            key={this.props.dialogKey + '-' + e.id + '-control'}
                            label={e.name}
                            unit={e.unit || ''}
                            value={this.state[e.id]}
                            language={I18n.getLanguage()}
                        />
                    );
                }
            }

            if (divider) {
                return [item, divider];
            } else {
                return item;
            }
        });
        return [
            (<h4   key={this.props.points[0].id + '_info_header'} style={Theme.dialog.header}>{this.props.name}</h4>),
            (<List key={this.props.points[0].id + '_info_list'}   style={Theme.dialog.list}>{result}</List>)
        ];
    }
}

export default SmartDialogInfo;
