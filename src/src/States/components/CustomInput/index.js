import { TextField } from '@mui/material';
import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import cls from './style.module.scss';
// import I18n from '@iobroker/adapter-react-v5/i18n';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CustomIcon from '@iobroker/adapter-react-v5/Components/Icon';

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
        className={clsx(cls.root, className)}
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