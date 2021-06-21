import React, { createRef, useEffect, useRef, useState } from 'react';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import { IconButton, Tooltip } from '@material-ui/core';
import { MdAvTimer } from 'react-icons/md';
import { FaRegCalendarTimes } from "react-icons/fa";
import clsx from 'clsx/dist/clsx';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import clearSky from './iconsWhether/clearSky.svg';
import fewClouds from './iconsWhether/fewClouds.svg';
import scatteredClouds from './iconsWhether/scatteredClouds.svg';
import brokenClouds from './iconsWhether/brokenClouds.svg';
import showerRain from './iconsWhether/showerRain.svg';
import rain from './iconsWhether/rain.svg';
import thunderstorm from './iconsWhether/thunderstorm.svg';
import snow from './iconsWhether/snow.svg';
import mist from './iconsWhether/mist.svg';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const nameIcon = {
    clouds: fewClouds,
    rain: rain,
    clear: clearSky
}

const getWeekDay = (date, index) => {
    const dayNumber = date.getDay();
    const idx = (dayNumber + index) > 6 ? (dayNumber + index) - 7 : (dayNumber + index);
    return days[idx];
}
const Wheather = ({
    doubleSize,
    socket,
    data
}) => {

    const temperatureFunc = (_, state) => {
        if (state.val && temperature.current) {
            temperature.current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const humidityFunc = (_, state) => {
        if (state.val && humidity.current) {
            humidity.current.innerHTML = `${Math.round(state.val)}%`;
        }
    }

    const [title, setTitle] = useState('');

    const titleFunc = (_, state) => {
        if (state.val) {
            setTitle(state.val);
        }
    }

    useEffect(() => {
        socket.subscribeState(data.temperature, temperatureFunc);
        socket.subscribeState(data.humidity, humidityFunc);
        socket.subscribeState(data.title, titleFunc);
        return () => {
            socket.unsubscribeState(data.temperature, temperatureFunc);
            socket.unsubscribeState(data.humidity, humidityFunc);
            socket.unsubscribeState(data.title, titleFunc);
        }
    }, []);

    const temperature = useRef();
    const humidity = useRef();
    const titleIcon = useRef();

    const date = new Date;

    const arrLength = data.array.length;    

    /// 
    const [temperatureMinRefs, setTemperatureMinRefs] = useState([]);
    const [temperatureMaxRefs, setTemperatureMaxRefs] = useState([]);
    const [titleRefs, setTitleRefs] = useState([]);

    useEffect(() => {
        setTemperatureMinRefs(temperatureMinRefs => (
            Array(arrLength).fill().map((_, i) => temperatureMinRefs[i] || createRef())
        ));
        setTemperatureMaxRefs(temperatureMaxRefs => (
            Array(arrLength).fill().map((_, i) => temperatureMaxRefs[i] || createRef())
        ));
        setTitleRefs(titleRefs => (
            Array(arrLength).fill().map((_, i) => titleRefs[i] || '')
        ));
    }, [arrLength]);


    const getIndex = (idx, func) => {
        return (_, state) => func(state, idx);
    }

    const temperatureMinFunc = (state, idx) => {
        if (state.val && temperatureMinRefs[idx]?.current) {
            temperatureMinRefs[idx].current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const temperatureMaxFunc = (state, idx) => {
        if (state.val && temperatureMaxRefs[idx]?.current) {
            temperatureMaxRefs[idx].current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const titleMinFunc = (state, idx) => {
        if (state.val) {
            setTitleRefs(titleRefs => titleRefs.map((_, i) => i === idx ? state.val : titleRefs[i]));
        }
    }

    useEffect(() => {
        const funcs = [];
        if (temperatureMinRefs.length) {            
            for (var i = 0; i < data.array.length; i++) {
                funcs[i] = {
                    min: getIndex(i, temperatureMinFunc),
                    max: null,
                };
                socket.subscribeState(data.array[i].temperatureMin, funcs[i].min);
                socket.subscribeState(data.array[i].temperatureMax, getIndex(i, temperatureMaxFunc));
                socket.subscribeState(data.array[i].title, getIndex(i, titleMinFunc));
            }
        }
        return () => {
            if (funcs.length) {
                for (var i = 0; i < data.array.length; i++) {
                    socket.unsubscribeState(data.array[i].temperatureMin, funcs[i].min);
                    socket.unsubscribeState(data.array[i].temperatureMax, getIndex(i, temperatureMaxFunc));
                    socket.unsubscribeState(data.array[i].title, getIndex(i, titleMinFunc));
                }
            }
        }
    }, [temperatureMinRefs])

    return <div className={cls.whetherkWrapper}>
        <div className={cls.wrapperBlock}>
            <div className={cls.iconWrapper}>
                <div ref={titleIcon}>
                    <IconAdapter className={cls.iconWhether} src={nameIcon[title?.toLowerCase()] || clearSky} />
                </div>
                <div className={cls.styleText}>{title}</div>
            </div>
            <div>
                <div ref={temperature} className={cls.temperatureTop}>18°C</div>
                <div ref={humidity} className={cls.humidity}>58%</div>
            </div>
        </div>
        <div className={cls.wrapperBottomBlock}>
            {data.array.map((e, idx) => <div className={cls.wrapperBottomBlockCurrent}>
                <div className={cls.date}>{I18n.t(getWeekDay(date, idx + 1))}</div>
                <div><IconAdapter className={cls.iconWhetherMin} src={nameIcon[titleRefs[idx]?.toLowerCase()] || clearSky} /></div>
                <div ref={temperatureMaxRefs[idx]} className={cls.temperature}>30°C</div>
                <div className={cls.temperature}>
                    <span ref={temperatureMinRefs[idx]}>19°C</span>
                </div>
                {/* <div>30°C<span>19°C</span></div> */}
            </div>)}
        </div>
    </div>
}

Wheather.defaultProps = {
    secondsParams: false,
    hour12Params: false,
    dayOfWeekParams: false,
    date: false,
    doubleSize: false
};

export default Wheather;