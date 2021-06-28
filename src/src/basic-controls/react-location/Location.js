import React, { useEffect, useRef, useState } from 'react';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react/i18n';
import { IconButton, Tooltip } from '@material-ui/core';
import { MdAvTimer } from 'react-icons/md';
import { FaRegCalendarTimes } from "react-icons/fa";
import clsx from 'clsx/dist/clsx';
// import {
//     interaction, layer, custom, control, //name spaces
//     Interactions, Overlays, Controls,     //group
//     Map, Layers, Overlay, Util    //objects
// } from "react-openlayers";
import 'ol/ol.css';
import { Map, View } from "ol";
// import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Tile from 'ol/layer/Tile';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';



const Location = ({ children, zoom, center }) => {
    const [map, setMap] = useState({});
    const [isMounted, setIsMounted] = useState(false);
    const mapElement = useRef(map);

    // const updateMap = () => {
    //     // if (!map) {
    //     const initialMap = new Map({
    //         target: mapElement.current,
    //         layers: [
    //             new TileLayer({
    //                 source: new OSM()
    //             })
    //         ],
    //         view: new View({
    //             center: [53.90170546878013, 27.55670285783708],
    //             zoom: 6
    //         }),
    //         controls: [],
    //         layers: [new Tile({ source: new OSM() })],
    //     });
    //     setMap(initialMap);
    //     if (mapElement.current) {
    //         setIsMounted(true)
    //     }
    //     // }
    // }

    useEffect(() => {
        if (isMounted) {
        } else {
            // updateMap();
        }
    })
    console.log(11223344, mapElement)
    return <div className={cls.mapWrapper}>
        {/* <div ref={mapElement} className={cls.map} >
        </div> */}
        <LeafletMap
            center={[0,0]}
            zoom={6}
            maxZoom={18}
            attributionControl={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
            style={{height:'100%'}}
            // whenCreated={this.onMap}
        >
            <TileLayer
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />
        </LeafletMap>
    </div>
}

Location.defaultProps = {
    children: '',
    zoom: 6,
    center: [0, 0]
};

export default Location;