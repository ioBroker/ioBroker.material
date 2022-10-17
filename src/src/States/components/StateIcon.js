import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TiCogOutline as IconWorking } from 'react-icons/ti';
import {
    MdGpsFixed,
    MdCenterFocusWeak,
    MdDirections,
    MdWork,
    MdDeveloperMode,
    MdError,
    MdBatteryAlert,
    MdPriorityHigh,
    MdPermScanWifi,
} from 'react-icons/md';
import {
    AiOutlineAppstoreAdd,
    AiOutlineRadiusBottomleft,
    AiOutlineColumnHeight,
    AiOutlineColumnWidth,
    AiOutlineSwap,
    AiFillPauseCircle,
    AiOutlinePoweroff,
    AiOutlineZoomIn
} from 'react-icons/ai';
import { BiLastPage } from 'react-icons/bi';
import {
    FaCompressArrowsAlt,
    FaRunning,
    FaSun,
    FaCompress,
    FaVolumeMute,
    FaToggleOn,
    FaDoorOpen
} from 'react-icons/fa';
import {
    GiLaserPrecision,
    GiStopSign,
    GiNuclearWaste,
    GiMatterStates,
    GiTreeSwing,
    GiSpeedometer,
    GiMovementSensor,
    GiRadialBalance
} from 'react-icons/gi';
import { IoIosWater } from 'react-icons/io';
import { SiBoost } from 'react-icons/si';
import { WiDaySunny, WiFire, WiHumidity, WiSmoke, WiThermometer } from 'react-icons/wi';
import { FiPower } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { IoColorFilter } from 'react-icons/io5';
import { RiBrush2Fill, RiBrush3Fill } from 'react-icons/ri';
import { TiWeatherNight } from 'react-icons/ti';


const STATES_NAME_ICONS = {
    'SET': AiOutlineAppstoreAdd,
    'WORKING': MdWork,
    'PARTY': MdWork,
    'UNREACH': MdPermScanWifi,
    'LOWBAT': MdBatteryAlert,
    'MAINTAIN': MdPriorityHigh,
    'ERROR': MdError,
    'DIRECTION': MdDirections,
    'CONNECTED': MdPermScanWifi,
    'ACTUAL': IconWorking,
    'SECOND': BiLastPage,
    'PRESS_LONG': FaCompressArrowsAlt,
    'PRESS': FaCompress,
    'MUTE': FaVolumeMute,
    'ACCURACY': GiLaserPrecision,
    'RADIUS': AiOutlineRadiusBottomleft,
    'ELEVATION': AiOutlineColumnHeight,
    'LATITUDE': AiOutlineColumnWidth,
    'LONGITUDE': AiOutlineSwap,
    'GPS': MdGpsFixed,
    'ON_ACTUAL': FaToggleOn,
    'ON_SET': FaToggleOn,
    'OPEN': FaDoorOpen,
    'STOP': GiStopSign,
    'WATER_ALARM': IoIosWater,  // water
    'WASTE_ALARM': GiNuclearWaste,
    'PAUSE': AiFillPauseCircle,
    'STATE': GiMatterStates,
    'BATTERY': MdBatteryAlert,
    'WASTE': GiNuclearWaste,
    'WATER': IoIosWater,
    'WORK_MODE': MdWork,
    'MODE': MdDeveloperMode,
    'POWER': AiOutlinePoweroff,
    'BOOST': SiBoost,
    'HUMIDITY': WiHumidity,
    'TEMPERATURE': WiThermometer,
    'BRIGHTNESS': WiDaySunny,
    'MOTION': FaRunning,
    'FIRE': WiFire,
    // 'WINDOW': WindowTilted,
    'SMOKE': WiSmoke,
    'SWING': GiTreeSwing,
    'SPEED': GiSpeedometer,
    'DIMMER': HiOutlineLightBulb,
    'ON': FiPower,
    'COLOR_TEMP': FaSun,
    'FILTER': IoColorFilter,
    'SIDE_BRUSH': RiBrush2Fill,
    'BRUSH': RiBrush3Fill,
    'SENSORS': GiMovementSensor,
    'AUTOFOCUS': MdCenterFocusWeak,
    'AUTOWHITEBALANCE': GiRadialBalance,
    'NIGHTMODE': TiWeatherNight,
    'PTZ': AiOutlineZoomIn,
    'ELECTRIC_POWER': AiOutlineZoomIn,
    'CURRENT': AiOutlineZoomIn,
    'VOLTAGE': AiOutlineZoomIn,
    'CONSUMPTION': AiOutlineZoomIn,
    'FREQUENCY': AiOutlineZoomIn
}

class StateIcon extends Component {
    render() {
        const Icon = this.props.type && STATES_NAME_ICONS[this.props?.type?.toUpperCase()];
        return Icon ? <Icon className={this.props.className || ''} /> : null;
    }
}

StateIcon.propTypes = {
    type: PropTypes.string,
    className: PropTypes.string,
};

export default StateIcon;