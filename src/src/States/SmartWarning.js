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
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import SmartGeneric from './SmartGeneric';
import Dialog from '../Dialogs/SmartDialogWarning';

const styles = {
    'icon-div': {
        position: 'absolute',
        width: 90,
        height: 90,
        zIndex: 0,
        left: 10,
        top: 24,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center'
    },
    'date-div': {
        position: 'absolute',
        zIndex: 1,
        width: 'calc(100% - 2rem - 90px)',
        top: 16,
        right: 16
    },
    'date-start': {
        fontWeight: 'normal',
        textAlign: 'left',
        width: '100%'
    },
    'date-end': {
        textAlign: 'right',
        fontWeight: 'normal',
        width: '100%'
    },
    'title-div': {
        position: 'absolute',
        zIndex: 1,
        fontWeight: 'bold',
        top: 55,
        width: 'calc(100% - 2rem - 90px)',
        right: 16,
        textAlign: 'left'
    },
    'title-text': {
    },
    'info-div': {
        position: 'absolute',
        zIndex: 1,
        maxWidth: 'calc(100% - 2rem - 90px)',
        fontWeight: 'normal',
        top: 75,
        right: 16,
        textAlign: 'left'
    },
    'info-text': {
        overflow: 'hidden',
        fontSize: 14
    }
};

class SmartWeatherForecast extends SmartGeneric {
    static propTypes = {
        classes:    PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.ids = {
            warning: null,
            title: null,
            info: null,
            start: null,
            end: null,
            icon: null,
            description: null
        };

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // Actual
            let state = this.channelInfo.states.find(state => state.id && state.name === 'LEVEL');
            if (state) {
                this.id = state.id;
                this.ids.warning = state.id;
            } else {
                this.id = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'TITLE');
            this.ids.title = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'INFO');
            this.ids.info = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'START');
            this.ids.start = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'END');
            this.ids.end = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ICON');
            this.ids.icon = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'DESC');
            this.ids.description = state && state.id;
        }

        this.width = 2;
        this.props.tile.setState({isPointer: false});
        this.props.tile.setState({state: true});
        this.key = 'smart-warning-' + this.id + '-';

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.componentReady();
    }

    onUpdateTimer() {
        this.collectTimer = null;
        if (this.collectState) {
            if (this.collectState[this.id] !== undefined) {
                this.props.tile.setVisibility(!!this.collectState[this.id]);
            }
            this.setState(this.collectState);
            this.collectState = null;
        }
    }

    updateState(id, state) {
        if (id === this.ids.title ||
            id === this.ids.info ||
            id === this.ids.icon) {
            this.collectState = this.collectState || {};
            this.collectState[id] = state.val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (id === this.ids.start ||
            id === this.ids.end) {
            this.collectState = this.collectState || {};
            if (typeof state.val === 'string') {
                const year = new Date().getFullYear();
                state.val = state.val.replace(year.toString(), '').replace((year + 1).toString(), '')
            }

            this.collectState[id] = state.val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (id === this.ids.warning) {
            const val = parseInt(state.val, 10) || 0;
            this.collectState = this.collectState || {};
            this.collectState[id] = val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else {
            console.log(id + ' => ' + state.val);
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();
        // remove doubleSize from list
        settings.forEach((item, i) => {
            if (item.name === 'doubleSize') {
                settings.splice(i, 1);
                return false
            }
        });
        return settings;
    }

    getIconDiv() {
        const classes = this.props.classes;
        if (!this.ids.icon || !this.state[this.ids.icon]) return null;

        return (<div key="icon" className={classes['icon-div']} style={{
            backgroundImage: 'url(' + this.state[this.ids.icon] + ')'
        }} />);
    }

    getDateDiv() {
        const classes = this.props.classes;
        let start = this.ids.start && this.state[this.ids.start];
        let end = this.ids.end && this.state[this.ids.end];

        return (<div key="date" className={classes['date-div']}>
            <div className={classes['date-start']}>{start}</div>
            {end ? (<div className={classes['date-end']}>-{end}</div>) : null}
        </div>);
    }

    getTitleDiv() {
        const classes = this.props.classes;
        let title = this.ids.title && this.state[this.ids.title];

        return (<div key="title" className={classes['title-div']}>
            <div className={classes['title-text']}>{title}</div>
        </div>);
    }

    getInfoDiv() {
        const classes = this.props.classes;
        let info = this.ids.info && this.state[this.ids.info];

        return (<div key="info" className={classes['info-div']}>
            <div className={classes['info-text']}>{info}</div>
        </div>);
    }

    render() {
        return this.wrapContent([
            this.getIconDiv(),
            this.getDateDiv(),
            this.getTitleDiv(),
            this.getInfoDiv(),
            this.state.showDialog ?
                <Dialog dialogKey={this.key + 'dialog'}
                        key={this.key + 'dialog'}
                        name={this.state.settings.name}
                        enumNames={this.props.enumNames}
                        settings={this.state.settings}
                        objects={this.props.objects}
                        onCollectIds={this.props.onCollectIds}
                        ids={this.ids}
                        windowWidth={this.props.windowWidth}
                        onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default withStyles(styles)(SmartWeatherForecast);
