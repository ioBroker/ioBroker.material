import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import clsx from 'clsx/dist/clsx';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Pin from '../../icons/Pin';
import L from 'leaflet';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';




const MapUpdate = ({ position }) => {
    const map = useMapEvents({
        click: () => {
            map.locate()
        },
        locationfound: (location) => {
            console.log(11223344, 'location found:', location)
        },
    })
    useEffect(() => {
        map.invalidateSize()
    })
    useEffect(() => {
        map.setView(position)
    }, [position])
    return null
}

const Location = ({ center, data, iconSetting }) => {
    const icon = L.divIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(<IconAdapter className={clsx(cls.iconStyle, iconSetting && cls.iconRadius)} src={iconSetting || <Pin className={cls.iconStyle} />} />)
    });
    const [position, setPosition] = useState([0, 0]);
    useEffect(() => {
        if (typeof center === 'string') {
            console.log(11223344, center)
            const parts = center.split(',').map(i => parseFloat(i.trim()));
            setPosition([parts[0], parts[1]]);
        }
    }, [center])
    return <div className={cls.mapWrapper}>
        <div className={cls.wrapperName}>{data.name}</div>
        <div className={cls.wrapperState}>{data.state}</div>
        <MapContainer
            // center={position}
            zoom={14}
            // maxZoom={18}
            attributionControl={false}
            zoomControl={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            dragging={false}
            animate={true}
            easeLinearity={0.35}
            className={cls.map}
        >
            <MapUpdate position={position} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker icon={icon} position={position}>
            </Marker>
        </MapContainer>
    </div>
}

Location.defaultProps = {
    center: '0, 0',
    data:{
        name:'',
        state:''
    },
    iconSetting:''
};

export default Location;