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
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import SmartGeneric from '../SmartGeneric';
import Utils from '@iobroker/adapter-react/Components/Utils';
import Dialog from '../../Dialogs/SmartDialogMap';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import Weather from '../../basic-controls/react-weather/Weather';
import { dialogChartCallBack } from '../../Dialogs/DialogChart';
import Location from '../../basic-controls/react-location/Location';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { Tile, Vector as LayerVector } from 'ol/layer';
import { Icon, Style } from 'ol/style';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { toLonLat, fromLonLat } from 'ol/proj';
import PinSVG from '../../icons/pin.svg';
import clsx from 'clsx/dist/clsx';
import Moment from 'react-moment';

const styles = {
    'currentIcon-div': {
        position: 'absolute',
        width: 90,
        height: 90,
        zIndex: 0,
        left: 3,
        top: 24
    },
    'currentIcon-icon': {
        width: '100%',
        zIndex: 0
    },
    'currentIcon-temperature': {
        position: 'absolute',
        width: '100%',
        fontSize: 40,
        zIndex: 1,
        fontWeight: 'normal',
        textAlign: 'right',
        color: '#9c9c9c',
        top: 8,
        right: -50
    },
    'currentDate-div': {
        position: 'absolute',
        zIndex: 1,
        width: 'calc(100% - 2rem)',
        top: 16,
        left: 16
    },
    'currentDate-date': {
        fontWeight: 'normal',
        display: 'inline-block',
    },
    'currentDate-location': {
        display: 'inline-block',
        position: 'absolute',
        textOverflow: 'ellipsis',
        width: 'calc(100% - 78px)',
        whiteSpace: 'nowrap',
        right: 0,
        textAlign: 'right'
    },
    'todayTemp-div': {
        position: 'absolute',
        zIndex: 1,
        fontWeight: 'normal',
        top: 35,
        maxWidth: 'calc(100% - 2rem - 90px)',
        right: 16,
        textAlign: 'right'
    },
    'todayTemp-temperature': {
    },
    'todayTemp-temperatureMin': {
    },
    'todayTemp-temperatureMax': {
        fontWeight: 'bold'
    },
    'todayTemp-temperatureTitle': {
    },
    'todayTemp-temperatureValue': {
    },
    'todayTemp-precipitation': {
    },
    'todayTemp-precipitationTitle': {
    },
    'todayTemp-precipitationValue': {
        paddingLeft: 2
    },
    'todayState-div': {
        position: 'absolute',
        zIndex: 1,
        width: 'calc(100% - 90px)',
        fontWeight: 'normal',
        bottom: 16,
        left: 80,
        textAlign: 'left'
    },
    'todayState-wind': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: 14
    },
    'todayState-windTitle': {
    },
    'todayState-windDir': {
        marginLeft: 2,
    },
    'todayState-windSpeed': {
        marginLeft: 2
    },
    'todayState-windIcon': {
        display: 'inline-block',
        marginLeft: 5,
        width: 16,
        maxHeight: 16
    },
    'todayState-windChill': {
    },
    'todayState-windChillTitle': {
        paddingRight: 5
    },
    'todayState-windChillValue': {
    },
    'todayState-state': {
        fontSize: 14
    }
};

class SmartLocation extends SmartGeneric {
    static propTypes = {
        classes: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // GPS
            let state = this.channelInfo.states.find(state => state.id && state.name === 'GPS');
            if (state) {
                this.id = state.id;
                this.gps = state.id;
            } else {
                this.id = '';
            }
            let parts = this.id.split('.');
            parts.pop();
            parts = parts.join('.');

            state = this.channelInfo.states.find(state => state.id && state.name === 'ELEVATION');
            this.elevation = state?.id || `${parts}.ELEVATION`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'RADIUS');
            this.radius = state?.id || `${parts}.RADIUS`;

            state = this.channelInfo.states.find(state => state.id && state.name === 'ACCURACY');
            this.accuracy = state?.id || `${parts}.ACCURACY`;

        }

        this.width = 2;
        this.props.tile.setState({ isPointer: false });
        this.props.tile.setState({ state: true });
        this.key = 'smart-location-' + this.id + '-';

        // this.stateRx.showDialogBottom = false;
        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.componentReady();
    }

    applySettings(settings) {
        settings = settings || (this.state && this.state.settings);
        if (settings) {
            if (settings.tempID && (!this.subscribes || this.subscribes.indexOf(settings.tempID) === -1)) {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.tempID);
            }
            if (settings.humidityID && (!this.subscribes || this.subscribes.indexOf(settings.humidityID) === -1)) {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.humidityID);
            }
        }
    }

    onUpdateTimer() {
        this.collectTimer = null;
        if (this.collectState) {
            this.setState(this.collectState);
            this.collectState = null;
        }
    }

    updateState(id, state) {
        let newState = {};
        if (!state) {
            return;
        }
        if (this.accuracy === id || id === this.id || id === this.radius || id === this.elevation) {
            newState[id] = typeof state.val !== 'number' ? state.val : parseFloat(state.val);
            if (typeof state.val === 'number' && isNaN(newState[id])) {
                newState[id] = null;
            }
            if (id === this.id) {
                if (state.lc) {
                    this.lastChange = state.lc;
                } else {
                    this.lastChange = 0;
                }
            }
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        let settings = super.getDialogSettings();
        // settings.push({
        //     name: 'chartLast',
        //     value: this.state.settings.chartLast || false,
        //     type: 'boolean'
        // });
        // settings.push({
        //     name: 'tempID',
        //     value: this.state.settings.tempID || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'humidityID',
        //     value: this.state.settings.humidityID || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'locationText',
        //     value: this.state.settings.locationText || '',
        //     type: 'string'
        // });
        // settings.push({
        //     name: 'hideFirstDay',
        //     value: this.state.settings.hideFirstDay || false,
        //     type: 'boolean'
        // });
        settings.push({
            name: 'zoomMiniMap',
            value: this.state.settings.zoomMiniMap || 12,
            max: 18,
            type: 'number'
        });
        settings.push({
            name: 'zoomDialogMap',
            value: this.state.settings.zoomDialogMap || 15,
            max: 18,
            type: 'number'
        });
        // remove doubleSize from list
        settings = settings.filter((e, i) => {
            if (e && (e.name === 'noAck'
                || e.name === 'colorOn'
                // || e.name === 'icon'
                || e.name === 'background'
            )) {
                return false;
            }
            return true;
        });
        return settings;
    }
    getStateText = () => {
        const state = this.state[this.id];
        if (state === undefined || state === null || !this.lastChange) {
            return null;
        } else {
            return (<Moment style={{ fontSize: 12 }} date={this.lastChange} interval={15} fromNow locale={I18n.getLanguage()} />);
        }
    }
    getLocation() {
        return <Location
            settings={this.state.settings}
            iconSetting={this.state.settings.icon || null}
            center={this.state[this.id]}
            data={this.getStandardContent(this.id, false, true)} />;
    }

    render() {
        return this.wrapContent([
            this.getLocation(),
            this.state.showDialog ?
                <Dialog 
                    dialogKey={this.key + 'dialog'}
                    key={this.key + 'dialog'}
                    transparent
                    name={this.state.settings.name}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    objects={this.props.objects}
                    ids={this.ids}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                    iconSetting={this.state.settings.icon || null}
                    center={this.state[this.id]}
                    data={this.getStandardContent(this.id, false, true)}
                    radius={this.state[this.radius]}
                    getReadHistoryData={(callback) => this.getReadHistoryData(this.id, callback)}
                /> : null
        ]);
    }
}

export default withStyles(styles)(SmartLocation);
