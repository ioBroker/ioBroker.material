import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';

import { Utils } from '@iobroker/adapter-react-v5';

import cls from './style.module.scss';

const CustomSwitch = ({ value, onChange, customValue }) => {
    const [switchChecked, setSwitchChecked] = useState(false);
    return <div className={cls.wrapperSwitch}>
        <div className={cls.switch}
            onClick={e => {
                e.stopPropagation();
                !customValue && setSwitchChecked(!switchChecked);
                onChange(!value);
            }}>
            <input type="checkbox" checked={!!(customValue ? value : switchChecked)} onChange={() => {}} />
            <span className={Utils.clsx(cls.slider, cls.round, value || switchChecked && cls.active)} />
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
