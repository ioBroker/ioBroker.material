import React, { createRef, useEffect, useRef, useState } from 'react';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import { IconButton, Tooltip } from '@material-ui/core';
import { MdAvTimer } from 'react-icons/md';
import { FaRegCalendarTimes } from "react-icons/fa";
import clsx from 'clsx/dist/clsx';
import IconAdapter, { getSystemIcon } from '@iobroker/adapter-react/Components/Icon';
import clearSky from './iconsWeather/clearSky.svg';
import fewClouds from './iconsWeather/fewClouds.svg';
import scatteredClouds from './iconsWeather/scatteredClouds.svg';
import brokenClouds from './iconsWeather/brokenClouds.svg';
import showerRain from './iconsWeather/showerRain.svg';
import rain from './iconsWeather/rain.svg';
import thunderstorm from './iconsWeather/thunderstorm.svg';
import snow from './iconsWeather/snow.svg';
import mist from './iconsWeather/mist.svg';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const nameIcon = {
    clouds: fewClouds,
    rain: rain,
    clear: clearSky
}

const icons = [{
    icon: clearSky,
    name: ['01d', '01n']
}, {
    icon: fewClouds,
    name: ['02d', '02n']
}, {
    icon: scatteredClouds,
    name: ['03d', '03n']
}, {
    icon: brokenClouds,
    name: ['04d', '04n']
}, {
    icon: showerRain,
    name: ['09d', '09n']
}, {
    icon: rain,
    name: ['10d', '10n']
}, {
    icon: thunderstorm,
    name: ['11d', '11n']
}, {
    icon: snow,
    name: ['13d', '13n']
}, {
    icon: mist,
    name: ['50d', '50n']
},
]

export const getIcon = (nameUri, decode) => {
    let name = nameUri;
    if (decode && nameUri) {
        name = decodeURI(nameUri.toString().split('/').pop().split('.')[0]);
    }
    const search = icons.find(el => el.name.find(nameIcon => nameIcon === name));
    if (search) {
        return search.icon;
    }
    return icons[0].icon;
}

const getWeekDay = (date, index) => {
    const dayNumber = date.getDay();
    const idx = (dayNumber + index) > 6 ? (dayNumber + index) - 7 : (dayNumber + index);
    return days[idx];
}
const Weather = ({
    doubleSize,
    socket,
    data
}) => {
    if(!data){
        return
    }
    const temperatureCallBack = (_, state) => {
        if (state?.val && temperature.current) {
            temperature.current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const humidityCallBack = (_, state) => {
        if (state?.val && humidity.current) {
            humidity.current.innerHTML = `${Math.round(state.val)}%`;
        }
    }

    const [title, setTitle] = useState('');
    const [iconName, setIconName] = useState('');

    const titleCallBack = (_, state) => {
        if (state?.val) {
            setTitle(state.val);
        }
    }

    const iconCallBack = (_, state) => {
        if (state?.val) {
            setIconName(state.val || '');
        }
    }

    useEffect(() => {
        data.current.temperature && socket.subscribeState(data.current.temperature, temperatureCallBack);
        data.current.humidity && socket.subscribeState(data.current.humidity, humidityCallBack);
        data.current.state && socket.subscribeState(data.current.state, titleCallBack);
        data.current.icon && socket.subscribeState(data.current.icon, iconCallBack);
        return () => {
            data.current.temperature && socket.unsubscribeState(data.current.temperature, temperatureCallBack);
            data.current.humidity && socket.unsubscribeState(data.current.humidity, humidityCallBack);
            data.current.state && socket.unsubscribeState(data.current.state, titleCallBack);
            data.current.icon && socket.unsubscribeState(data.current.icon, iconCallBack);
        }
    }, []);

    const temperature = useRef();
    const humidity = useRef();
    const titleIcon = useRef();

    const date = new Date;

    const arrLength = data.days.length;

    /// 
    const [temperatureMinRefs, setTemperatureMinRefs] = useState([]);
    const [temperatureMaxRefs, setTemperatureMaxRefs] = useState([]);
    const [titleRefs, setTitleRefs] = useState([]);
    const [iconNames, setIconNames] = useState([]);

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
        setIconNames(iconNames => (
            Array(arrLength).fill().map((_, i) => iconNames[i] || '')
        ));
    }, [arrLength]);


    const getIndex = (idx, callBack) => {
        return (_, state) => callBack(state, idx);
    }

    const temperatureMinCallBack = (state, idx) => {
        if (state?.val && temperatureMinRefs[idx]?.current) {
            temperatureMinRefs[idx].current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const temperatureMaxCallBack = (state, idx) => {
        if (state?.val && temperatureMaxRefs[idx]?.current) {
            temperatureMaxRefs[idx].current.innerHTML = `${Math.round(state.val)}°C`;
        }
    }

    const titleMinCallBack = (state, idx) => {
        if (state?.val) {
            setTitleRefs(titleRefs => titleRefs.map((_, i) => i === idx ? state.val : titleRefs[i]));
        }
    }

    const iconsCallBack = (state, idx) => {
        if (state?.val) {
            setIconNames(iconNames => iconNames.map((_, i) => i === idx ? state.val : iconNames[i]));
        }
    }

    useEffect(() => {
        const callBacks = [];
        if (temperatureMinRefs.length) {
            for (var i = 0; i < data.days.length; i++) {
                callBacks[i] = {
                    min: getIndex(i, temperatureMinCallBack),
                    max: getIndex(i, temperatureMaxCallBack),
                    state: getIndex(i, titleMinCallBack),
                    icon: getIndex(i, iconsCallBack)
                };
                data.days[i].temperatureMin && socket.subscribeState(data.days[i].temperatureMin, callBacks[i].min);
                data.days[i].temperatureMax && socket.subscribeState(data.days[i].temperatureMax, callBacks[i].max);
                data.days[i].state && socket.subscribeState(data.days[i].state, callBacks[i].state);
                data.days[i].icon && socket.subscribeState(data.days[i].icon, callBacks[i].icon);
            }
        }
        return () => {
            if (callBacks.length) {
                for (var i = 0; i < data.days.length; i++) {
                    data.days[i].temperatureMin && socket.unsubscribeState(data.days[i].temperatureMin, callBacks[i].min);
                    data.days[i].temperatureMax && socket.unsubscribeState(data.days[i].temperatureMax, callBacks[i].max);
                    data.days[i].state && socket.unsubscribeState(data.days[i].state, callBacks[i].state);
                    data.days[i].icon && socket.unsubscribeState(data.days[i].icon, callBacks[i].icon);
                }
            }
        }
    }, [temperatureMinRefs])
    return <div className={cls.whetherkWrapper}>
        <div className={cls.wrapperBlock}>
            <div className={cls.iconWrapper}>
                <div className={clsx(cls.iconWhetherWrapper, !arrLength && cls.noteArrayIcon)}>
                    <IconAdapter className={cls.iconWhether} src={getIcon(iconName, true) || clearSky} />
                </div>
                <div className={cls.styleText}>{title}</div>
            </div>
            <div>
                <div ref={temperature} className={cls.temperatureTop}>-°C</div>
                <div ref={humidity} className={cls.humidity}>-%</div>
            </div>
        </div>
        {arrLength > 0 && <div className={cls.wrapperBottomBlock}>
            {data.days.map((e, idx) => <div className={cls.wrapperBottomBlockCurrent}>
                <div className={cls.date}>{I18n.t(getWeekDay(date, idx + 1))}</div>
                <div><IconAdapter className={cls.iconWhetherMin} src={getIcon(iconNames[idx], true) || clearSky} /></div>
                <div ref={temperatureMaxRefs[idx]} className={cls.temperature}>-°C</div>
                <div className={cls.temperature}>
                    <span ref={temperatureMinRefs[idx]}>-°C</span>
                </div>
                {/* <div>30°C<span>19°C</span></div> */}
            </div>)}
        </div>}
    </div>
}

Weather.defaultProps = {
    secondsParams: false,
    hour12Params: false,
    dayOfWeekParams: false,
    date: false,
    doubleSize: false
};

export default Weather;