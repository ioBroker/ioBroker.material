/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import clsx from 'clsx';

import I18n from '@iobroker/adapter-react/i18n';
import { MdFilterCenterFocus } from "react-icons/md";

import SmartDialogGeneric from './SmartDialogGeneric';
import cls from './style.module.scss';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Circle } from 'react-leaflet';
import Pin from '../icons/Pin';
import L from 'leaflet';
import CustomFab from '../States/components/CustomFab';

const MapUpdate = ({ position, setMap }) => {
    const map = useMapEvents({ });
    useEffect(() => {
        setMap(map);
        map.setView(position, undefined, { noMoveStart: true });
    }, []);
    useEffect(() => {
        map.invalidateSize()
    });

    return null
}

const Location = ({ center, data, iconSetting, getReadHistoryData, radius, settings }) => {
    const icon = L.divIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(iconSetting ? <img className={clsx(cls.iconStyle, cls.iconRadius)} src={iconSetting} alt="icon" /> : <Pin className={cls.iconStyle} />)
    });

    const [position, setPosition] = useState([0, 0]);
    const [zoom] = useState(settings?.zoomDialogMap || 15);
    const [history, setHistory] = useState([]);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (typeof center === 'string') {
            const parts = center.split(',').map(i => parseFloat(i.trim()));
            setPosition([parts[0], parts[1]]);
        }
    }, [center])
    useEffect(() => {
        getReadHistoryData((value) => {
            const newHistory = value.filter(el => typeof el === 'string').map(el => {
                const parts = el.split(',').map(i => parseFloat(i.trim()));
                return [parts[0], parts[1]];
            })
            setHistory(newHistory);
        })
    }, [center]);

    return <div className={cls.mapWrapper}>
        <div className={cls.wrapperName}>{data.name}</div>
        <div className={cls.wrapperMapState}>{data.state}</div>
        <CustomFab
            active
            onClick={() => {
                if (map) {
                    map.setView(position, zoom);
                }
            }}
            className={cls.mapCenter}
        >
            <MdFilterCenterFocus style={{ width: 25, height: 25 }} />
        </CustomFab>
        <MapContainer
            // center={position}
            zoom={zoom}
            // maxZoom={18}
            attributionControl={false}
            zoomControl={true}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
            className={cls.map}
        >
            <MapUpdate setMap={setMap} position={position} />
            {radius && <Circle
                className={cls.mapCircle} center={position} radius={radius} />}
            {history.length > 0 && <Polyline
                className={cls.mapPolyline}
                positions={history} />}
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
    data: {
        name: '',
        state: ''
    },
    iconSetting: ''
};

class SmartDialogMap extends SmartDialogGeneric {
    // expected:
    // center
    // data
    // getReadHistoryData
    // radius
    // iconSetting
    // states
    constructor(props) {
        super(props);
        this.componentReady();
    }

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <Location
                iconSetting={this.props.iconSetting}
                center={this.props.center}
                data={this.props.data}
                getReadHistoryData={this.props.getReadHistoryData}
                radius={this.props.radius}
                settings={this.props.settings}
            />
        </div>;
    }
}

SmartDialogMap.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string.isRequired,
    windowWidth: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    transparent: PropTypes.string,
    enumNames: PropTypes.number,
    settings: PropTypes.bool,
    iconSetting: PropTypes.bool,
    center: PropTypes.string,
    data: PropTypes.object,
    radius: PropTypes.number,
    getReadHistoryData: PropTypes.func,

    objects: PropTypes.object,
    ids: PropTypes.object,
    onValueChange: PropTypes.func,
    actualValue: PropTypes.number,
};

export default SmartDialogMap;
