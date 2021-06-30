import React from 'react';
import PropTypes from 'prop-types';
import { Fab } from '@material-ui/core';
import cls from './style.module.scss';
import clsx from 'clsx';

const CustomFab = ({ fullWidth, size, onClick, style, className, children, active, title }) => {
    return <Fab
        variant="outlined"
        color="primary"
        title={title}
        onClick={onClick}
        fullWidth={fullWidth}
        style={style}
        className={clsx(cls.root, className && className, active && cls.active)}
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