/**
 * Copyright 2021 bluefox <dogafox@gmail.com>
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

import { FaVideo as IconCam } from 'react-icons/fa';
import SmartGeneric from '../SmartGeneric';
import Dialog from '../../Dialogs/SmartDialogURL';
import Theme from '../../theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import Clock from '../../basic-controls/react-clock/Clock';
import cls from './style.module.scss';

const styles = {
    'title-div': {
        position: 'absolute',
        zIndex: 1,
        fontWeight: 'bold',
        bottom: 0,
        left: 0,
        height: 48,
        background: 'rgba(255,255,255,0.45)',
        color: 'rgba(0, 0, 0, 0.6)',
        width: '100%',
        textAlign: 'left'
    },
    'title-text': {
        paddingLeft: 16,
        paddingTop: 16,
    },
    iframe: {
        position: 'absolute',
        zIndex: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: 0
    }
};

class SmartClock extends SmartGeneric {
    static propTypes = {
        classes: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.ids = {
            url: null,
        };

        if (this.channelInfo.states) {
            // Actual
            let state = this.channelInfo.states.find(state => state && state.id && state.name === 'URL');
            if (state) {
                this.id = state.id;
                this.ids.url = state.id;
                const settingsId = state.settingsId;
                if (settingsId) {
                    const settings = Utils.getSettingsCustomURLs(this.props.objects[settingsId], null, { user: this.props.user });
                    if (settings) {
                        const tile = settings.find(e => e.id === state.id);
                        if (tile) {
                            this.stateRx.settings = JSON.parse(JSON.stringify(tile));
                            this.customSettings = this.stateRx.settings;
                        }
                    }
                }
            } else {
                this.id = '';
            }
        }


        this.collectState = null;
        this.collectTimer = null;

        this.props.tile.setState({ isPointer: false });
        // this.props.tile.setState({ state: true });
        this.key = 'smart-clock-';
        this.props.tile.setVisibility(!!this.stateRx.settings);
        // this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.interval = null;

        this.componentReady();
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.onUpdateTimer(), 1000);
    }

    onUpdateTimer() {

    }

    getDialogSettings() {
        let settings = super.getDialogSettings();

        settings.unshift({
            name: '12/24',
            value: this.state.settings['12/24'] || false,
            type: 'boolean'
        });

        settings.unshift({
            name: 'seconds',
            value: this.state.settings.seconds || false,
            type: 'boolean'
        });

        settings.unshift({
            name: 'dayOfWeek',
            value: this.state.settings.dayOfWeek || false,
            type: 'boolean'
        });

        settings.unshift({
            name: 'date',
            value: this.state.settings.date || false,
            type: 'boolean'
        });

        settings.unshift({
            name: 'doubleSize',
            value: this.state.settings.doubleSize || false,
            type: 'boolean'
        });
        // remove name from list
        settings = settings.filter((e, i) => {
            if (e && (e.name === 'name'
                || e.name === 'noAck'
                || e.name === 'colorOn'
                || e.name === 'icon'
                || e.name === 'background'
            )) {
                return false;
            }
            return true;
        });

        settings.unshift({
            type: 'delete'
        });

        return settings;
    }

    saveDialogSettings(settings) {
        if (settings) {

        }

        super.saveDialogSettings(settings, function (newSettings) {
            this.customSettings = newSettings;
            this.componentDidMount();
            this.setState({ settings: newSettings });
        }.bind(this));
    }

    getClock() {
        return (
            <div key={this.key + 'icon'} className={cls.wrapContent}>
                <Clock
                    secondsParams={this.state?.settings?.seconds}
                    dayOfWeekParams={this.state?.settings?.dayOfWeek}
                    hour12Params={this.state?.settings['12/24']}
                    date={this.state?.settings?.date}
                    doubleSize={this.state?.settings?.doubleSize}
                />
            </div>
        );
    }

    onDialogClose = () => {
        // super.onDialogClose();
        this.setState({ showDialog: false });
        // start timer again
        this.componentDidMount();
    }

    render() {
        return this.wrapContent([
            this.getClock(),
            this.state.showDialog ?
                <Dialog dialogKey={this.key + 'dialog'}
                    key={this.key + 'dialog'}
                    name={this.state.settings ? this.state.settings.name || '' : ''}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    objects={this.props.objects}
                    image={this.image}
                    onCollectIds={this.props.onCollectIds}
                    ids={this.ids}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default withStyles(styles)(SmartClock);
