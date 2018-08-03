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
import Utils from '../Utils';
import Dialog from '../Dialogs/SmartDialogWeatherForecast';
import I18n from '../i18n';

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
        width: 'calc(100% - 2em)',
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
        maxWidth: 'calc(100% - 2em - 90px)',
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

class SmartWeatherForecast extends SmartGeneric {
    static propTypes = {
        classes:    PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.ids = {
            current: {
                date: null,
                location: null,
                icon: null,
                state: null,
                temperature: null,
                humidity: null,
                windChill: null,
                windSpeed: null,
                windIcon: null,
                windDirection: null,
                pressure: null,
                precipitation: null
            },
            days: [
                {
                    date: null,
                    icon: null,
                    state: null,
                    temperature: null,
                    temperatureMin: null,
                    temperatureMax: null,
                    humidity: null,
                    humidityMin: null,
                    humidityMax: null,
                    windSpeed: null,
                    windIcon: null,
                    windDirection: null,
                    precipitation: null,
                    pressure: null
                }
            ]
        };

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            //console.log(JSON.stringify(this.channelInfo.states, null, 2));

            // Actual
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ICON');
            if (state) {
                this.id = state.id;
                this.ids.current.icon = state.id;
            } else {
                this.id = '';
            }
            state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP');
            this.ids.current.temperature = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'STATE');
            this.ids.current.state = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'DATE');
            this.ids.current.date = state && state.id;

            if (!this.ids.current.date) {
                state = this.channelInfo.states.find(state => state.id && state.name === 'DOW');
                this.ids.current.date = state && state.id;
            }

            state = this.channelInfo.states.filter(state => state.id && state.name === 'LOCATION').map(state => state.id);
            this.ids.current.location = state && state.length && state;

            state = this.channelInfo.states.find(state => state.id && state.name === 'HUMIDITY');
            this.ids.current.humidity = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PRESSURE');
            this.ids.current.pressure = state && state.id;
            this.pressureUnit = '';
            if (this.ids.current.pressure) {
                const obj = this.props.objects[this.ids.current.pressure];
                if (obj && obj.common && obj.common.unit) {
                    this.pressureUnit = ' ' + I18n.t(obj.common.unit);
                }
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_SPEED');
            this.ids.current.windSpeed = state && state.id;
            this.windUnit = '';
            if (this.ids.current.windSpeed) {
                const obj = this.props.objects[this.ids.current.windSpeed];
                if (obj && obj.common && obj.common.unit) {
                    this.windUnit = ' ' + I18n.t(obj.common.unit);
                }
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_CHILL');
            this.ids.current.windChill = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'FEELS_LIKE');
            if (!this.ids.current.windChill) {
                this.ids.current.windChill = state && state.id;
            } else if (state) {
                const pos = this.subscribes.indexOf(state.id);
                this.subscribes.splice(pos, 1);
                state.id = null;
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_ICON');
            this.ids.current.windIcon = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_DIRECTION');
            this.ids.current.windDirection = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_DIRECTION_STR');
            if (!this.ids.current.windDirection) {
                this.ids.current.windDirection = state && state.id;
            } else if (state) {
                const pos = this.subscribes.indexOf(state.id);
                this.subscribes.splice(pos, 1);
                state.id = null;
            }

            state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP_MIN');
            this.ids.current.temperatureMin = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP_MAX');
            this.ids.current.temperatureMax = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'PRECIPITATION_CHANCE');
            this.ids.current.precipitation = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'HISTORY_CHART');
            this.ids.current.history = state && state.id;

            state = this.channelInfo.states.find(state => state.id && state.name === 'FORECAST_CHART');
            this.ids.current.chart = state && state.id;

            for (let d = 0; d < 6; d++) {
                this.ids.days[d] = this.ids.days[d] || {};

                state = this.channelInfo.states.find(state => state.id && state.name === 'DATE' + d);
                this.ids.days[d].date = state && state.id;

                if (!this.ids.days[d].date) {
                    state = this.channelInfo.states.find(state => state.id && state.name === 'DOW' + d);
                    this.ids.days[d].date = state && state.id;
                }
                state = this.channelInfo.states.find(state => state.id && state.name === 'ICON' + d);
                this.ids.days[d].icon = state && (state.id !== this.id) && state.id ;

                state = this.channelInfo.states.find(state => state.id && state.name === 'STATE' + d);
                this.ids.days[d].state = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP_MIN' + d);
                this.ids.days[d].temperatureMin = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP_MAX' + d);
                this.ids.days[d].temperatureMax = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'TEMP' + d);
                this.ids.days[d].temperature = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'HUMIDITY' + d);
                this.ids.days[d].humidity = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'HUMIDITY_MIN' + d);
                this.ids.days[d].humidityMin = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'HUMIDITY_MAX' + d);
                this.ids.days[d].humidityMax = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_SPEED' + d);
                this.ids.days[d].windSpeed = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_ICON' + d);
                this.ids.days[d].windIcon = state && state.id;

                state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_DIRECTION' + d);
                this.ids.days[d].windDirection = state && state.id;

                if (!this.ids.days[d].windDirection) {
                    state = this.channelInfo.states.find(state => state.id && state.name === 'WIND_DIRECTION_STR' + d);
                    this.ids.days[d].windDirection = state && state.id;
                }

                state = this.channelInfo.states.find(state => state.id && state.name === 'PRECIPITATION_CHANCE' + d);
                this.ids.days[d].precipitation = state && state.id;

                let isEmpty = true;
                for (const id in this.ids.days[d]) {
                    if (this.ids.days[d].hasOwnProperty(id) && this.ids.days[d][id]) {
                        isEmpty = false;
                        break
                    }
                }
                if (isEmpty) {
                    this.ids.days[d] = null;
                }
            }

            let max = this.ids.days.length - 1;
            while (!this.ids.days[max] && max >= 0) {
                max--;
            }
            if (max < this.ids.days.length && !this.ids.days[max + 1]) {
                this.ids.days.splice(max + 1, this.ids.days.length  - max - 1);
            }
        }

        this.width = 2;
        this.props.tile.setState({isPointer: false});
        this.props.tile.setState({state: true});
        this.key = 'smart-weather-' + this.id + '-';

        this.stateRx.showDialog = false; // support dialog in this tile used in generic class)

        this.componentReady();
    }

    applySettings(settings) {
        settings = settings || (this.state && this.state.settings);
        if (settings) {
            if (settings.tempID && (!this.subscribes || this.subscribes.indexOf(settings.tempID) === -1))  {
                this.subscribes = this.subscribes || [];
                this.subscribes.push(settings.tempID);
            }
            if (settings.humidityID && (!this.subscribes || this.subscribes.indexOf(settings.humidityID) === -1))  {
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
        if (id === this.ids.current.temperature ||
            id === this.ids.current.humidity ||
            id === this.ids.current.windChill ||
            id === this.ids.current.windSpeed ||
            id === this.state.settings.tempID ||
            id === this.state.settings.humidityID ||
            id === this.ids.current.temperatureMin ||
            id === this.ids.current.temperatureMax ||
            id === this.ids.current.precipitation ||
            id === this.ids.current.pressure) {
            const val = Math.round(parseFloat(state.val));
            if (!isNaN(val)) {
                this.collectState = this.collectState || {};
                this.collectState[id] = val;
                this.collectTimer && clearTimeout(this.collectTimer);
                this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
            }
        } else
        if (id === this.ids.current.icon ||
            id === this.ids.current.state ||
            id === this.ids.current.windIcon) {
            this.collectState = this.collectState || {};
            this.collectState[id] = state.val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        }  else
        if (this.ids.current.location && this.ids.current.location.indexOf(id) !== -1) {
            this.collectState = this.collectState || {};
            if (state.val && state.val.replace(/[,.-]/g, '').trim()) {
                this.collectState.location = state.val || '';
            }
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else if (id === this.ids.current.windDirection || id === this.ids.current.windDegrees) {
            let dir = '';
            if (state && state.val !== null && state.val !== '' && state.val !== undefined && (typeof state.val === 'number' || parseInt(state.val, 10).toString() === state.val.toString())) {
                dir = I18n.t('wind_' + Utils.getWindDirection(state.val)).replace('wind_', '');
            } else {
                dir = state.val;
            }

            this.collectState = this.collectState || {};
            this.collectState[id] = dir;
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        }  else if (id === this.ids.current.date) {
            let date = '';

            if (state && state.val) {
                date = Utils.date2string(state.val) || '';
            }

            this.collectState = this.collectState || {};
            this.collectState[id] = date;
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else {
            console.log(id + ' => ' + state.val);
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();
        settings.push({
            name: 'chartLast',
            value: this.state.settings.chartLast || false,
            type: 'boolean'
        });
        settings.push({
            name: 'tempID',
            value: this.state.settings.tempID || '',
            type: 'string'
        });
        settings.push({
            name: 'humidityID',
            value: this.state.settings.humidityID || '',
            type: 'string'
        });
        settings.push({
            name: 'locationText',
            value: this.state.settings.locationText || '',
            type: 'string'
        });
        settings.push({
            name: 'hideFirstDay',
            value: this.state.settings.hideFirstDay || false,
            type: 'boolean'
        });
        return settings;
    }

    getCurrentIconDiv() {
        const classes = this.props.classes;
        let temp;
        temp = this.state.settings.tempID && this.state[this.state.settings.tempID];
        if (!temp && temp !== 0) {
            temp = this.ids.current.temperature && this.state[this.ids.current.temperature];
        }
        return (<div  key="todayIcon" className={classes['currentIcon-div']}>
            <img className={classes['currentIcon-icon']} src={this.state[this.ids.current.icon]} alt={this.state[this.ids.current.state] || ''}/>
            {temp !== null && temp !== undefined ? (<div className={classes['currentIcon-temperature']}>{temp}°</div>) : null}
        </div>);
    }

    getCurrentDateLocationDiv() {
        const classes = this.props.classes;
        let date = this.ids.current.date && this.state[this.ids.current.date];
        let location = this.state.settings.locationText;
        location = location || this.state.location;

        location = location || I18n.t('Weather');
        date = date || Utils.date2string(new Date());

        return (<div key="location" className={classes['currentDate-div']}>
            <div className={classes['currentDate-date']}>{date},</div>
            <div className={classes['currentDate-location']}>{location}</div>
        </div>);
    }

    getTodayWindDiv() {
        const classes = this.props.classes;
        let windChill = this.ids.current.windchill && this.state[this.ids.current.date];
        let windDir = this.ids.current.windDirection && this.state[this.ids.current.windDirection];
        if (windDir !== null && windDir !== undefined && (typeof windDir === 'number' || parseInt(windDir, 10) === windDir)) {
            windDir = I18n.t('wind_' + Utils.getWindDirection(windDir)).replace('wind_', '');
        }
        let windSpeed = this.ids.current.windSpeed && this.state[this.ids.current.windSpeed];
        let windIcon = this.ids.current.windIcon && this.state[this.ids.current.windIcon];

        let state = this.ids.current.state && this.state[this.ids.current.state];
        return (<div key="todayWind" className={classes['todayState-div']}>

            {windChill !== null && windChill !== undefined ?
                (<div key="windChill" className={classes['todayState-windChill']}>
                    <span className={classes['todayState-windChillTitle']}>{I18n.t('Windchill')}: </span>
                    <span className={classes['todayState-windChillValue']}>{windChill}</span>
                </div>)
                : null}

            {(windDir !== null && windDir !== undefined) || (windSpeed !== null && windSpeed !== undefined) ?
                (<div key="wind" className={classes['todayState-wind']}>
                    <span key="windTitle" className={classes['todayState-windTitle']}>{I18n.t('Wind')}:</span>
                    {windIcon ? (<img className={classes['todayState-windIcon']} src={windIcon} alt="state"/>) : null}
                    {windDir ? (<span className={classes['todayState-windDir']}>{windDir}</span>) : null}
                    {windSpeed !== null && windSpeed !== undefined && !isNaN(windSpeed) ? (<span key="windSpeed" className={classes['todayState-windSpeed']}>{windSpeed}{this.windUnit}</span>) : null}
                </div>)
                : null}

            {state ? (<div key="state" className={classes['todayState-state']}>{state}</div>) : null}
        </div>);
    }

    getTodayTempDiv() {
        const classes = this.props.classes;
        let tempMin = this.ids.current.temperatureMin && this.state[this.ids.current.temperatureMin];
        let tempMax = this.ids.current.temperatureMax && this.state[this.ids.current.temperatureMax];
        let precipitation = this.ids.current.precipitation && this.state[this.ids.current.precipitation];

        let temp;
        if (tempMin !== null && tempMin !== undefined &&
            tempMax !== null && tempMax !== undefined && tempMin !== tempMax) {
            temp = [
                (<span key="max" className={classes['todayTemp-temperatureMax']}>{tempMax}°</span>),
                (<span key="mid"> / </span>),
                (<span key="min" className={classes['todayTemp-temperatureMin']}>{tempMin}°</span>)
            ];
        } else if (
            (tempMin !== null && tempMin !== undefined) ||
            (tempMax !== null && tempMax !== undefined)) {
            if (tempMin === null || tempMin === undefined) {
                tempMin = tempMax;
            }
            temp = (<span key="max" className={classes['todayTemp-temperatureMax']}>{tempMin}°</span>);
        }

        if (!temp && !precipitation && precipitation !== 0) {
            return null;
        }

        return (<div key="todayTemp" className={classes['todayTemp-div']}>
            {temp !== null && temp !== undefined ?
                (<div key="temp" className={classes['todayTemp-temperature']}>
                    <span className={classes['todayTemp-temperatureValue']}>{temp}</span>
                </div>)
                : null}

            {precipitation !== null && precipitation !== undefined ?
                (<div key="precipitation" className={classes['todayTemp-precipitation']}>
                    <span key="windTitle" className={classes['todayTemp-precipitationTitle']}>{I18n.t('Precip.')}:</span>
                    <span className={classes['todayTemp-precipitationValue']}>{precipitation}%</span>
                </div>)
                : null}
        </div>);
    }

    render() {
        return this.wrapContent([
            this.getCurrentIconDiv(),
            this.getCurrentDateLocationDiv(),
            this.getTodayWindDiv(),
            this.getTodayTempDiv(),
            this.state.showDialog ?
                <Dialog dialogKey={this.key + 'dialog'}
                        key={this.key + 'dialog'}
                        name={this.state.settings.name}
                        enumNames={this.props.enumNames}
                        settings={this.state.settings}
                        objects={this.props.objects}
                        windUnit={this.windUnit}
                        pressureUnit={this.pressureUnit}
                        onCollectIds={this.props.onCollectIds}
                        ids={this.ids}
                        windowWidth={this.props.windowWidth}
                        onClose={this.onDialogClose.bind(this)}
                /> : null
        ]);
    }
}

export default withStyles(styles)(SmartWeatherForecast);
