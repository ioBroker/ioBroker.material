import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import { Utils, Icon as CustomIcon } from '@iobroker/adapter-react-v5';

import cls from './style.module.scss';

const CustomInput = ({ autoFocus, min, max, onKeyDown, fullWidth, disabled, multiline, rows, autoComplete, label, error, size, variant, value, type, style, onChange, className, icon }) => {
    return <TextField
        error={!!error}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        label={label}
        disabled={disabled}
        variant={variant || 'standard'}
        multiline={multiline}
        rows={rows}
        value={value}
        type={type}
        min={min}
        max={max}
        onKeyDown={onKeyDown}
        helperText={error}
        style={style}
        className={Utils.clsx(cls.root, className)}
        autoComplete={autoComplete}
        onChange={e => {
            onChange(e.target.value);
        }}
        InputProps={{
            endAdornment: icon ?
                <InputAdornment position="end"><CustomIcon className={cls.icon} src={icon} /></InputAdornment>
                : null
        }}
        // margin="normal"
        size={size}
    />;
}

CustomInput.defaultProps = {
    value: '',
    type: 'text',
    error: '',
    className: null,
    table: false,
    native: {},
    variant: 'standard',
    size: 'medium',
    component: null,
    styleComponentBlock: null,
    onChange: () => { },
    fullWidth: false,
    autoComplete: '',
    autoFocus: false,
    rows: 1
};

CustomInput.propTypes = {
    title: PropTypes.string,
    attr: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
    native: PropTypes.object,
    onChange: PropTypes.func,
    component: PropTypes.object,
    styleComponentBlock: PropTypes.object
};

export default CustomInput;