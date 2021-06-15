import React, { useEffect, useState } from 'react';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import { IconButton, Tooltip } from '@material-ui/core';
import { MdAvTimer } from 'react-icons/md';
import { FaRegCalendarTimes } from "react-icons/fa";
import clsx from 'clsx/dist/clsx';

const standardOptions = {
    hour: '2-digit',
    minute: '2-digit',

}
const showSecondsOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}

const format = (x, y) => {
    let z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, (v) => {
        return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2)
    });

    return y.replace(/(y+)/g, (v) => {
        return x.getFullYear().toString().slice(-v.length)
    });
}

const Clock = ({
    secondsParams,
    hour12Params,
    dayOfWeekParams,
    date,
    doubleSize
}) => {
    let subscribeTime = null;

    // const [showSeconds, setShowSeconds] = useState(!!secondsParams);
    // const [hour12, setHour12] = useState(!!hour12Params);
    const [dayOfWeek, setDayOfWeek] = useState(!!dayOfWeekParams ? new Intl.DateTimeFormat(I18n.getLanguage(), { weekday: 'long' }).format(new Date()) : null);
    const [time, setTime] = useState(new Date().toLocaleTimeString(I18n.getLanguage(),
        Object.assign(secondsParams ? showSecondsOptions : standardOptions, { hour12: hour12Params })));

    const updateTime = () => {
        const newTime = new Date().toLocaleTimeString(I18n.getLanguage(), Object.assign(secondsParams ? showSecondsOptions : standardOptions, {
            hour12: hour12Params
        }));
        setTime(newTime.replace(/[AP]M/gi, " "));
        if (dayOfWeekParams) {
            setDayOfWeek(new Intl.DateTimeFormat(I18n.getLanguage(), { weekday: 'long' }).format(new Date()));
        }
    }

    useEffect(() => {
        if (subscribeTime) {
            clearInterval(subscribeTime);
        }
        subscribeTime = setInterval(updateTime, 100);
        return () => {
            if (subscribeTime) {
                clearInterval(subscribeTime);
            }
        }
    }, [hour12Params, secondsParams]);

    return <div className={cls.clockWrapper}>
        <div className={clsx(cls.clock, !secondsParams && cls.noWidth, !doubleSize && cls.clockSmall )}>
            <div className={clsx(cls.timeWrapper, !doubleSize && cls.timeWrapperSmall, !secondsParams && !doubleSize && cls.clockBigSmall)}>
                {time}{hour12Params && <span>pm</span>}
            </div>
        </div>
        <div className={clsx(cls.dayOfWeek, !dayOfWeek && cls.emptyDayOfWeek, !doubleSize && cls.dayOfWeekSmall)}>
            {dayOfWeek}{date && <span>{format(new Date(), 'dd.MM.yyyy')}</span>}
        </div>
    </div>
}

Clock.defaultProps = {
    secondsParams: false,
    hour12Params: false,
    dayOfWeekParams: false,
    date: false,
    doubleSize: false
};

export default Clock;