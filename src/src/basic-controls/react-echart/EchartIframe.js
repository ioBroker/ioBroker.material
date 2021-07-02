import React, { useEffect, useState } from 'react';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import { IconButton, Tooltip } from '@material-ui/core';
import { MdAvTimer } from 'react-icons/md';
import { FaRegCalendarTimes } from "react-icons/fa";
import clsx from 'clsx/dist/clsx';

const EchartIframe = ({
    name
}) => {
    let subscribeTime = null;

    // const [showSeconds, setShowSeconds] = useState(!!secondsParams);
    // const [hour12, setHour12] = useState(!!hour12Params);

    return <div className={cls.echartWrapper}>
        {name && <div className={cls.name}>{name}</div>}
        <iframe className={cls.iframe} src={`${window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':8082' : ''}/echarts/index.html?preset=${'echarts.0.MyChar'}t&noBG=true&compact=true`} />
    </div>
}

EchartIframe.defaultProps = {
    secondsParams: false,
    hour12Params: false,
    dayOfWeekParams: false,
    date: false,
    doubleSize: false
};

export default EchartIframe;