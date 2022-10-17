import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Types} from 'iobroker.type-detector';

import {AiOutlineLineChart as TypeIconChart} from 'react-icons/ai';
import TypeIconBlinds from './icons/Jalousie';
// import TypeIconButton from './icons/PushButton';
import {GoDeviceCameraVideo as TypeIconCamera} from 'react-icons/go';
import {FaExternalLinkSquareAlt as TypeIconURL} from 'react-icons/fa';
import {FaImage as TypeIconImage} from 'react-icons/fa';
import {FaRegLightbulb as TypeIconDimmer} from 'react-icons/fa';
import TypeIconDoor from './icons/DoorOpened';
import TypeIconFireAlarm from './icons/FireOn';
import TypeIconFloodAlarm from './icons/FloodOn';
// import TypeIconGate from './icons/Gate';
import TypeIconHumidity from './icons/Humidity';
import {FaInfoCircle as TypeIconInfo} from 'react-icons/fa';
import { TiLightbulb as IconLight } from 'react-icons/ti';
// import {FaLightbulb as TypeIconLight} from 'react-icons/fa';
import {FaLock as TypeIconLock} from 'react-icons/fa';
import {FaStreetView as TypeIconLocation} from 'react-icons/fa';
import {FaStepForward as TypeIconMedia} from 'react-icons/fa';
import TypeIconMotion from './icons/MotionOn';
// import TypeIconRGB from './icons/RGB';
import {MdFormatColorFill as TypeIconCT} from 'react-icons/md';
// import TypeIconRGBSingle from './icons/RGB';
import {MdFormatColorFill as TypeIconHUE} from 'react-icons/md';
import {FaSlidersH as TypeIconSlider} from 'react-icons/fa';
import TypeIconSocket from './icons/Socket';
import TypeIconTemperature from './icons/Thermometer';
// import TypeIconThermostat from './icons/Thermostat';
// import TypeIconValve from './icons/HeatValve';
import {FaVolumeDown as TypeIconVolume} from 'react-icons/fa';
import {FaVolumeUp as TypeIconVolumeGroup} from 'react-icons/fa';
import TypeIconWindow from './icons/WindowOpened';
import TypeIconWindowTilt from './icons/WindowTilted';
import {WiCloudy as TypeIconWeather} from 'react-icons/wi';
import {MdWarning as TypeIconWarning} from 'react-icons/md';
import {FaFan as TypeIconAC} from 'react-icons/fa';
import {IoIosRadioButtonOn as TypeIconButtonSensor} from 'react-icons/io';
import TypeIconVacuumCleaner from '../../../icons/RobotVacuum';

import IconAdapter from '@iobroker/adapter-react-v5/Components/Icon';

const TYPE_ICONS = {
    [Types.airCondition]: TypeIconAC,
    [Types.blind]: TypeIconBlinds,
    // [Types.button]: TypeIconButton,
    [Types.buttonSensor]: TypeIconButtonSensor,
    [Types.camera]: TypeIconCamera,
    [Types.chart]: TypeIconChart,
    [Types.url]: TypeIconURL,
    [Types.image]: TypeIconImage,
    [Types.dimmer]: TypeIconDimmer,
    [Types.door]: TypeIconDoor,
    [Types.fireAlarm]: TypeIconFireAlarm,
    'sensor.alarm.fire': TypeIconFireAlarm,
    [Types.floodAlarm]: TypeIconFloodAlarm,
    'sensor.alarm.flood': TypeIconFireAlarm,
    // [Types.gate]: TypeIconGate,
    [Types.humidity]: TypeIconHumidity,
    [Types.info]: TypeIconInfo,
    [Types.light]: IconLight,
    [Types.lock]: TypeIconLock,
    [Types.location]: TypeIconLocation,
    [Types.media]: TypeIconMedia,
    [Types.motion]: TypeIconMotion,
    // [Types.rgb]: TypeIconRGB,
    [Types.ct]: TypeIconCT,
    // [Types.rgbSingle]: TypeIconRGBSingle,
    [Types.hue]: TypeIconHUE,
    [Types.slider]: TypeIconSlider,
    [Types.socket]: TypeIconSocket,
    [Types.temperature]: TypeIconTemperature,
    // [Types.thermostat]: TypeIconThermostat,
    // [Types.valve]: TypeIconValve,
    [Types.vacuumCleaner]: TypeIconVacuumCleaner,
    [Types.volume]: TypeIconVolume,
    [Types.volumeGroup]: TypeIconVolumeGroup,
    [Types.window]: TypeIconWindow,
    [Types.windowTilt]: TypeIconWindowTilt,
    [Types.weatherCurrent]: TypeIconWeather,
    [Types.weatherForecast]: TypeIconWeather,
    [Types.warning]: TypeIconWarning,
};

const defaultStyle = {
    marginTop: 4,
    marginRight: 4,
    width: 22,
    height: 22,
};

class TypeIcon extends Component {
    render() {
        if (!!this.props.src) {
            return <IconAdapter src={this.props.src} style={Object.assign({}, !this.props.className && defaultStyle, this.props.style || {})} className={this.props.className || ''} alt=""/>;
        } else {
            const Icon = this.props.type && TYPE_ICONS[this.props.type];
            return Icon ? <Icon style={Object.assign({}, !this.props.className && defaultStyle, this.props.style || {})} className={this.props.className || ''}/> : null;
        }
    }
}

TypeIcon.propTypes = {
    type: PropTypes.string,
    style: PropTypes.object,
    src: PropTypes.string,
    className: PropTypes.string,
};

export default TypeIcon;