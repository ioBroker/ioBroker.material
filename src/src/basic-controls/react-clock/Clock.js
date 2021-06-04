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

const Clock = ({
    secondsParams,
    hour12Params,
    dayOfWeekParams,
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
        <div className={cls.clock}>
            <div className={cls.timeWrapper}>
                {time}
            </div>
            <div className={clsx(cls.dayOfWeek, !dayOfWeek && cls.emptyDayOfWeek)}>
                {dayOfWeek}
            </div>
        </div>
        <div className={cls.wrapperButtons}>
            <Tooltip title={I18n.t('')}>
                <IconButton
                // onClick={() => setHour12(!hour12)}
                >
                    <div className={clsx(cls.hour12, cls.defColor)}>
                        {I18n.t(hour12Params ? '12h' : '24h')}
                    </div>
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Seconds')}>
                <IconButton
                    className={clsx(secondsParams ? cls.color : cls.defColor)}
                // onClick={() => setShowSeconds(!showSeconds)}
                >
                    <MdAvTimer />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Day of week')}>
                <IconButton
                    className={clsx(dayOfWeek ? cls.color : cls.defColor)}
                // onClick={() => {
                //     if (dayOfWeek) {
                //         setDayOfWeek(null)
                //     } else {
                //         setDayOfWeek(new Intl.DateTimeFormat(I18n.getLanguage(), { weekday: 'long' }).format(new Date()))
                //     }
                // }}
                >
                    <FaRegCalendarTimes />
                </IconButton>
            </Tooltip>
        </div>
    </div>
}

Clock.defaultProps = {
    secondsParams: false,
    hour12Params: false,
    dayOfWeekParams: false,
};

export default Clock;