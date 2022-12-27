import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@mui/material';

import { Utils } from '@iobroker/adapter-react-v5';

import cls from './style.module.scss';
import UtilsColor from '../../../UtilsColors';

const CustomSlider = ({ value, className, onChange, hue, orientation, temperature, tMin, tMax, minMax }) => {
    const rgb = hue === '#FFFFFF' ?
        '#FFFFFF' :
        temperature ? UtilsColor.rgb2string(UtilsColor.temperatureToRGB(hue)) : UtilsColor.rgb2string(UtilsColor.hslToRgb(hue / 360, 1, 0.5));
    const rgba = UtilsColor.hexToRgbA(rgb, 0.4);
    const color = temperature ? `linear-gradient(to bottom, white 0%,#ff9226 100%)` : `linear-gradient(to ${!orientation ? 'right' : 'top'}, rgba(0, 0, 0, 1) 0%,${rgba} 100%)`;
    const colorGenerate = value || value === 0 ? 255 - 256 / 24 * value || 1 : 255;
    return <Slider
        className={Utils.clsx(orientation ? cls.rootVertical : cls.root, className)}
        onChange={(e, v) => onChange(minMax ? Math.ceil((((tMax - tMin) / 100) * v) + tMin) : v)}
        value={minMax ? 100 * (value - tMin) / (tMax - tMin) : value}
        orientation={orientation ? 'vertical' : 'horizontal'}
        scale={(x) => <div className={Utils.clsx(cls.scale, temperature && cls.scaleFont)} style={hue === undefined ? null : { color: `rgb(${colorGenerate}, ${colorGenerate}, ${colorGenerate})`, background: temperature ? rgb : UtilsColor.hexToRgbA(rgb, value || value === 0 ? value / 100 : 1) }} >{temperature ? hue : minMax ? Math.ceil((((tMax - tMin) / 100) * x) + tMin) : x}</div>}
        style={hue === undefined ? null : { background: color }}
        classes={{
            track: orientation ? cls.trackVertical : cls.track,
            rail: orientation ? cls.railVertical : cls.rail,
            thumb: orientation ? cls.thumbVertical : cls.thumb,
            valueLabel: cls.valueLabel
        }}
        valueLabelDisplay="auto"
    />;
}

CustomSlider.defaultProps = {
    value: '',
    className: null,
    variant: 'standard',
    size: 'medium',
    fullWidth: false,
    square: false,
    active: false,
    orientation: false,
    temperature: false,
    tMax: 100,
    tMin: 0,
    minMax: false,
    onChange: () => { }
};

CustomSlider.propTypes = {
    title: PropTypes.string,
    attr: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
};

export default CustomSlider;