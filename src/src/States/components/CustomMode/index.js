import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { ButtonGroup, FormControl, FormLabel } from '@mui/material';

import { Utils } from '@iobroker/adapter-react-v5';

import cls from './style.module.scss';
import CustomButton from '../CustomButton';
import CustomSelect from '../CustomSelect';

const CustomMode = ({ label, objs, value, orientation, onChange, className }) => {

    const [longerLength, setLongerLength] = useState(false);

    const resizeThrottler = () => {
        const sizeDocument = orientation === 'horizontal' ? document.documentElement.clientWidth : document.documentElement.clientHeight;
        if (orientation === 'horizontal' && 90 * Object.keys(objs).length + 50 > sizeDocument) {
            return setLongerLength(true);
        }
        if (orientation === 'vertical' && 30 * Object.keys(objs).length + 50 > sizeDocument) {
            return setLongerLength(true);
        }
        return setLongerLength(false);
    }

    useEffect(() => {
        window.addEventListener("resize", resizeThrottler);
        resizeThrottler();
        return () => {
            window.removeEventListener("resize", resizeThrottler);
        }
    }, []);
    return <FormControl className={Utils.clsx(cls.styleGroup, className)} component="fieldset" variant="standard">
        <FormLabel component="legend">{label}</FormLabel>
        {!longerLength ? <ButtonGroup color="primary" orientation={orientation}>
            {Object.keys(objs).map(name => <CustomButton
                onClick={() => onChange(name)}
                active={String(value) === name}
                key={name}>
                {objs[name]}
            </CustomButton>)}
        </ButtonGroup> :
            <CustomSelect
                onChange={onChange}
                customValue
                value={value}
                optionsName
                options={Object.keys(objs)}
                objs={objs}
            />
        }
    </FormControl>;
}

CustomMode.defaultProps = {
    className: null,
    value: '',
    objs: {},
    label: '',
    onChange: () => { },
    orientation: 'horizontal'
};

CustomMode.propTypes = {
    objs: PropTypes.object,
    style: PropTypes.object,
    label: PropTypes.string,
    orientation: PropTypes.string,
    onChange: PropTypes.func
};

export default CustomMode;