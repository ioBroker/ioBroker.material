import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import cls from './style.module.scss';
import clsx from 'clsx';

const CustomSwitch = ({ value, onChange, customValue }) => {
    const [switchChecked, setSwitchChecked] = useState(false);
    return <div className={cls.wrapperSwitch}>
        <div className={cls.switch}
            onClick={e => {
                !customValue && setSwitchChecked(!switchChecked);
                onChange(!value);
            }}>
            <input type="checkbox" checked={!!(customValue ? value : switchChecked)} onChange={() => {}}/>
            <span className={clsx(cls.slider, cls.round, value || switchChecked && cls.active)}/>
        </div>
    </div>;
}

CustomSwitch.defaultProps = {
    value: false,
    onChange: () => { },
    customValue: false,
};

CustomSwitch.propTypes = {
    onChange: PropTypes.func,
};

export default memo(CustomSwitch);