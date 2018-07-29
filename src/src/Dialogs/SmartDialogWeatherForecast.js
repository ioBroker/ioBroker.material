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
import Paper from '@material-ui/core/Paper';

import Utils from '../Utils';
import SmartDialogGeneric from './SmartDialogGeneric';
import I18n from '../i18n';

const HEIGHT_HEADER  = 64;
const HEIGHT_CURRENT = 128;
const HEIGHT_DAY     = 96;

const styles = {
    'header-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'current-div': {
        height: HEIGHT_CURRENT,
        width: 'calc(100% - 1em)',
        position: 'relative'
    },
    'currentIcon-div': {
        position: 'absolute',
        width: 90,
        height: 90,
        zIndex: 0,
        left: -3,
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
        width: 'calc(100% - 75px)',
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
        marginLeft: 5
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
    },
    'day-div': {
        height: HEIGHT_DAY,
        width: 'calc(100% - 1em)',
        marginTop: 16,
        position: 'relative'
    }
};

class SmartDialogWeatherForecast extends SmartDialogGeneric  {
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
        onCollectIds:       PropTypes.func,
        enumNames:          PropTypes.array,
        onControl:          PropTypes.func,
        ids:                PropTypes.object.isRequired,
        settings:           PropTypes.object
    };

    constructor(props) {
        super(props);

        this.ids = this.props.ids;

        for (const type in this.ids) {
            if (this.ids.hasOwnProperty(type) && type !== 'buttons') {
                for (const id in this.ids[type]) {
                    if (this.ids[type].hasOwnProperty(id)) {
                        this.subscribes = this.subscribes || [];
                        this.subscribes.push(this.ids[type][id]);
                    }
                }
            }
        }
        let maxHeight = 0;

        this.divs = {
            'header':  {height: HEIGHT_HEADER,   position: 'top',    visible: true},
            'current': {height: HEIGHT_CURRENT,  position: 'top',    visible: true}
        };
        for (let d = 0; d < this.ids.days.length; d++) {
            if (this.ids.days[d]) {
                this.divs['day' + d] = {height: HEIGHT_DAY,      position: 'top',    visible: true};
            }
        }
        // calculate positions
        let top = 0;
        let bottom = 0;
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                maxHeight += this.divs[name].height;
                if (this.divs[name].position === 'top') {
                    this.divs[name].points = top;
                    top += this.divs[name].height;
                }
            }
        }
        const keys = Object.keys(this.divs);
        for (let j = keys.length - 1; j >= 0; j--) {
            if (this.divs[keys[j]].visible && this.divs[keys[j]].position === 'bottom') {
                this.divs[keys[j]].points = bottom;
                bottom += this.divs[keys[j]].height;
            }
        }
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                this.divs[name].style = Object.assign({}, {[this.divs[name].position] : this.divs[name].points});
            }
        }

        this.dialogStyle = {
            maxHeight: maxHeight
        };

        const enums = [];
        this.props.enumNames.forEach(e => (enums.indexOf(e) === -1) && enums.push(e));
        if (enums.indexOf(this.props.name) === -1) {
            enums.push(this.props.name);
        }
        this.name = enums.join(' / ');
        this.collectState = null;
        this.collectTimer = null;

        this.componentReady();
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
        } else if (id === this.ids.current.windDirection) {
            let dir = '';
            if (state && state.val !== null && state.val !== '' && state.val !== undefined && (typeof state.val === 'number' || parseInt(state.val, 10).toString() === state.val.toString())) {
                dir = I18n.t('wind_' + Utils.getWindDirection(dir)).replace('wind_', '');
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
                const m = state.val.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (m) {
                    date = new Date(m[3] + '-' + m[2] + '-' + m[1]);
                } else {
                    date = new Date(state.val);
                }
                date = Utils.date2string(new Date(date)) || '';
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

    getHeaderDiv() {
        if (!this.divs.header.visible) return null;
        return (<div key="header" className={this.props.classes['header-div']} style={this.divs.header.style}>{this.name}</div>);
    }
    getCurrentIconDiv() {
        const classes = this.props.classes;
        const temp = this.ids.current.temperature && this.state[this.ids.current.temperature];
        return (<div  key="todayIcon" className={classes['currentIcon-div']}>
            <img className={classes['currentIcon-icon']} src={this.state[this.ids.current.icon]} alt={this.state[this.ids.current.state] || ''}/>
            {temp !== null && temp !== undefined ? (<div className={classes['currentIcon-temperature']}>{temp}°</div>) : null}
        </div>);
    }

    getCurrentDateLocationDiv() {
        const classes = this.props.classes;
        let date = this.ids.current.date && this.state[this.ids.current.date];
        let location = this.state.location;

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
            tempMax !== null && tempMax !== undefined) {
            temp = [
                (<span key="max" className={classes['todayTemp-temperatureMax']}>{tempMax}°</span>),
                (<span key="mid"> / </span>),
                (<span key="min" className={classes['todayTemp-temperatureMin']}>{tempMin}°</span>)
            ];
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

    getDayDiv(d) {
        return (<Paper className={this.props.classes['day-div']} style={this.divs['day' + d]}>

        </Paper>);
    }

    getDaysDiv() {
        return this.ids.days.filter(day => day).map(function (day, d) {return this.getDayDiv(d);}.bind(this));
    }

    getCurrentDiv() {
        return (
            <Paper className={this.props.classes['current-div']}>
                {this.getCurrentIconDiv()}
                {this.getCurrentDateLocationDiv()}
                {this.getTodayWindDiv()}
                {this.getTodayTempDiv()}
            </Paper>);
    }

    generateContent() {
        const result = this.getDaysDiv() || [];
        result.unshift(this.getCurrentDiv());
        result.unshift(this.getHeaderDiv());
        return result;
    }
}

export default withStyles(styles)(SmartDialogWeatherForecast);