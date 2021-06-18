import React from 'react';
import PropTypes from 'prop-types';
import { Fab, Slider } from '@material-ui/core';
import cls from './style.module.scss';
import clsx from 'clsx';
import UtilsColor from '../../../UtilsColors';

const CustomSlider = ({ fullWidth, size, onClick, value, className, onChange, hue }) => {

    const rgb = hue === '#FFFFFF' ? '#FFFFFF' : UtilsColor.rgb2string(UtilsColor.hslToRgb(hue / 360, 1, 0.5));
    const rgba = UtilsColor.hexToRgbA(rgb, 0.4);
    const color = 'linear-gradient(to right, rgba(0, 0, 0, 1) 0%,' + rgba + ' 100%)';
    const colorGenerate = value || value === 0 ? 255 - 256 / 24 * value || 1 : 255;
    return <Slider
        className={clsx(cls.root,className)}
        onChange={(e, v) => onChange(v)}
        value={value}
        scale={(x) => <div className={cls.scale} style={{ color: `rgb(${colorGenerate}, ${colorGenerate}, ${colorGenerate})`, background: UtilsColor.hexToRgbA(rgb, value || value === 0 ? value / 100 : 1) }} >{x}</div>}
        style={{ background: color }}
        classes={{
            track: cls.track,
            rail: cls.rail,
            thumb: cls.thumb,
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
    onChange: () => { }
};

CustomSlider.propTypes = {
    title: PropTypes.string,
    attr: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
};

export default CustomSlider;