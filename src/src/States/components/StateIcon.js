import React from 'react';
import PropTypes from 'prop-types';

import { TiCogOutline as IconWorking } from 'react-icons/ti';
import { MdPermScanWifi as IconUnreach } from 'react-icons/md';
import { MdPriorityHigh as IconMaintain } from 'react-icons/md';
import { MdBatteryAlert as IconLowbat } from 'react-icons/md';
import { MdError as IconError } from 'react-icons/md';
import { MdDirections } from 'react-icons/md';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { BiLastPage } from 'react-icons/bi';
import { FaCompressArrowsAlt, FaRunning, FaSun } from 'react-icons/fa';
import { FaCompress } from 'react-icons/fa';
import { FaVolumeMute } from 'react-icons/fa';
import { GiLaserPrecision } from 'react-icons/gi';
import { AiOutlineRadiusBottomleft } from 'react-icons/ai';
import { AiOutlineColumnHeight } from 'react-icons/ai';
import { AiOutlineColumnWidth } from 'react-icons/ai';
import { AiOutlineSwap } from 'react-icons/ai';
import { FaToggleOn } from 'react-icons/fa';
import { FaDoorOpen } from 'react-icons/fa';
import { MdGpsFixed } from 'react-icons/md';
import { GiStopSign } from 'react-icons/gi';
import { IoIosWater } from 'react-icons/io';
import { GiNuclearWaste } from 'react-icons/gi';
import { AiFillPauseCircle } from 'react-icons/ai';
import { GiMatterStates } from 'react-icons/gi';
import { MdWork } from 'react-icons/md';
import { MdDeveloperMode } from 'react-icons/md';
import { AiOutlinePoweroff } from 'react-icons/ai';
import { SiBoost } from 'react-icons/si';
import { WiDaySunny, WiFire, WiHumidity, WiSmoke, WiThermometer } from 'react-icons/wi';
import { GiTreeSwing } from 'react-icons/gi';
import { GiSpeedometer } from 'react-icons/gi';
// import WindowTilted from './icons/WindowTilted';
import { FiPower, HiOutlineLightBulb } from "react-icons/all";
import { Component } from 'react';

const STATES_NAME_ICONS = {
    'SET': AiOutlineAppstoreAdd,
    'WORKING': MdWork,
    'PARTY': MdWork,
    'UNREACH': IconUnreach,
    'LOWBAT': IconLowbat,
    'MAINTAIN': IconMaintain,
    'ERROR': IconError,
    'DIRECTION': MdDirections,
    'CONNECTED': IconUnreach,
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
    'BATTERY': IconLowbat,
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