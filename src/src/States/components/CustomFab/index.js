import React from 'react';
import PropTypes from 'prop-types';
import { Fab } from '@mui/material';

import { Utils } from '@iobroker/adapter-react-v5';

import cls from './style.module.scss';

const CustomFab = ({ fullWidth, size, onClick, style, className, children, active, title }) => {
    return <Fab
        color="primary"
        title={title}
        onClick={onClick}
        //fullWidth={fullWidth}
        style={style}
        className={Utils.clsx(cls.root, className, active && cls.active)}
        margin="normal"
        size={size}
    >
        {children}
    </Fab>;
}

CustomFab.defaultProps = {
    value: '',
    title: '',
    className: null,
    variant: 'standard',
    size: 'medium',
    fullWidth: false,
    square: false,
    active: false
};

CustomFab.propTypes = {
    title: PropTypes.string,
    attr: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
};

export default CustomFab;