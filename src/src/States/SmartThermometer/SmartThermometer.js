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
import React from 'react';
import SmartGeneric from '../SmartGeneric';
import IconThermometer from '../../icons/Thermometer';
import IconHydro from '../../icons/Humidity';

import Theme from '../../theme';
import I18n from '@iobroker/adapter-react/i18n';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';
import cls from './style.module.scss';
import clsGeneric from '../style.module.scss';
import clsx from 'clsx/dist/clsx';
import ReactEcharts from 'echarts-for-react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
//import echarts from 'echarts/lib/echarts';
//import 'echarts/lib/chart/line';
//mport 'echarts/lib/component/tooltip';
//import 'echarts/lib/component/grid';
//import 'echarts/lib/component/toolbox';
//import 'echarts/lib/component/title';
//import 'echarts/lib/component/dataZoom';
//import 'echarts/lib/component/timeline';
//import 'zrender/lib/svg/svg';
import { Flag } from '@material-ui/icons';

class SmartThermometer extends SmartGeneric {
    constructor(props) {
        super(props);
        if (this.channelInfo.states) {
            let state = this.channelInfo.states.find(state => state.id && state.name === 'ACTUAL');
            if (state) {
                this.id = state.id;
            } else {
                this.id = '';
            }

            // could be only "humidity"
            state = this.channelInfo.states.find(state => state.id && state.name === 'SECOND');
            if (state) {
                this.secondary = {
                    id: state.id
                };
            }
        }

        this.props.tile.state.state = true;
        this.stateRx.showDialog = false
        // if only humidity
        if (!this.secondary &&
            this.props.objects[this.id] &&
            this.props.objects[this.id].common &&
            this.props.objects[this.id].common.role &&
            this.props.objects[this.id].common.role.match(/humidity/i)
        ) {
            this.isHumidityMain = true;
        } else
            if (this.secondary && this.props.objects[this.secondary.id] && this.props.objects[this.secondary.id].common) {
                // detect type of secondary info
                const secondary = this.props.objects[this.secondary.id].common;
                if (secondary.role.match(/humidity/i)) {
                    this.secondary.icon = IconHydro;
                    this.secondary.iconStyle = { color: '#0056c3' };
                } else {
                    this.secondary.iconStyle = {};
                }
                this.secondary.title = secondary.name || this.secondary.id.split('.').pop();
                if (typeof this.secondary.title === 'object') {
                    this.secondary.title = this.secondary.title[I18n.getLanguage()] || this.secondary.title.en;
                }
                this.secondary.unit = secondary.unit ? ' ' + secondary.unit : '';
            }

        if (this.id && this.props.objects[this.id] && this.props.objects[this.id] && this.props.objects[this.id].common.unit) {
            this.unit = ' ' + this.props.objects[this.id].common.unit;
        } else {
            this.unit = '';
        }

        this.props.tile.setState({ isPointer: false });

        this.key = 'smart-thermometer-' + this.id + '-';

        //this.props.tile.registerHandler('onClick', this.onTileClick.bind(this));
        this.componentReady();
    }

    updateState(id, state) {
        if (!state) {
            return;
        }
        if (id === this.id) {
            const newState = {};
            newState[id] = state.val;

            this.setState(newState);
        } else if (this.secondary && this.secondary.id === id) {
            const newState = {};
            newState[id] = state.val;
            this.setState(newState);
        } else {
            super.updateState(id, state);
        }
    }

    getIcon() {
        let customIcon;

        if (this.state.settings.useDefaultIcon) {
            customIcon = (<IconAdapter alt="icon" src={this.getDefaultIcon()} style={{ height: '100%', zIndex: 1 }} />);
        } else {
            if (this.state.settings.icon) {
                customIcon = (<IconAdapter alt="icon" src={this.state.settings.icon} style={{ height: '100%', zIndex: 1 }} />);
            } else {
                customIcon = (<IconThermometer className={clsGeneric.iconStyle} />);
            }
        }

        return SmartGeneric.renderIcon(customIcon);
    }
    readHistory = () => {
        /*interface GetHistoryOptions {
            instance?: string;
            start?: number;
            end?: number;
            step?: number;
            count?: number;
            from?: boolean;
            ack?: boolean;
            q?: boolean;
            addID?: boolean;
            limit?: number;
            ignoreNull?: boolean;
            sessionId?: any;
            aggregate?: 'minmax' | 'min' | 'max' | 'average' | 'total' | 'count' | 'none';
        }*/
        const now = new Date();
            now.setHours(now.getHours() - 24);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            let start = now.getTime();
            let end = Date.now();

        const options = {
            instance:  'history.0',
            start,
            end,
            step:      3600000,
            from:      false,
            ack:       false,
            q:         false,
            addID:     false,
            aggregate: 'minmax'
        };

        // if (end - start > 60000 * 24) {
        //     options.aggregate = 'minmax';
        //     //options.step = 60000;
        // }
        this.props.socket.getObjects().then(e=>{
            // debugger
        }).catch(e=>{
            // debugger
        });

        this.props.socket.connected = true;

        return this.props.socket.getHistory(this.id, options)
            .then(values => {
                // debugger
                // merge range and chart
                let chart = [];
                let r     = 0;
                let range = this.rangeValues;
                let minY  = null;
                let maxY  = null;

                for (let t = 0; t < values.length; t++) {
                    if (range) {
                        while (r < range.length && range[r].ts < values[t].ts) {
                            chart.push(range[r]);
                            console.log(`add ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                            r++;
                        }
                    }
                    // if range and details are not equal
                    if (!chart.length || chart[chart.length - 1].ts < values[t].ts) {
                        chart.push(values[t]);
                        console.log(`add value ${new Date(values[t].ts).toISOString()}: ${values[t].val}`)
                    } else if (chart[chart.length - 1].ts === values[t].ts && chart[chart.length - 1].val !== values[t].ts) {
                        console.error('Strange data!');
                    }
                    if (minY === null || values[t].val < minY) {
                        minY = values[t].val;
                    }
                    if (maxY === null || values[t].val > maxY) {
                        maxY = values[t].val;
                    }
                }

                if (range) {
                    while (r < range.length) {
                        chart.push(range[r]);
                        console.log(`add range ${new Date(range[r].ts).toISOString()}: ${range[r].val}`);
                        r++;
                    }
                }

                // sort
                chart.sort((a, b) => a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0));

                this.chartValues = chart;
                this.minY = minY;
                this.maxY = maxY;

                if (this.minY < 10) {
                    this.minY = Math.round(this.minY * 10) / 10;
                } else {
                    this.minY = Math.ceil(this.minY);
                }
                if (this.maxY < 10) {
                    this.maxY = Math.round(this.maxY * 10) / 10;
                } else {
                    this.maxY = Math.ceil(this.maxY);
                }
                return chart;
            })
            .catch(e=>{
                console.error('Cannot read history: ' + e);
            })
    }

    getCharts=()=>{
        console.log(11223344,this)
        this.readHistory(0,1000);
        const option = {
            animation: true,
            legend: {
                show: false,
            },
            grid: {
                show: false,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            xAxis: 
                {
                    show: false,
                    boundaryGap: false,
                    data: [" ", " ", " ", " ", " ", " ", " ",]
                }
            ,
            yAxis: {
                    show: false,
                    type: "value"
            },
            series: [
                {
                    silent: true,
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    color:'#f85e27',
                    areaStyle: { color:'#f85e276b' },
                    data: [150, 232, 201, 154, 190, 330, 410]
                }
            ]
        };
    
        return <div className={cls.wrapperCharts}>
            <ReactEcharts 
                className={cls.styleCharts} 
                //echarts={ echarts }
                option={option} 
                opts={{ renderer: 'svg' }}
                notMerge={ true }
                lazyUpdate={ true }
            />
        </div>;
    }

    getSecondaryDiv() {
        if (!this.secondary || !this.secondary.id || this.state[this.secondary.id] === undefined || this.state[this.secondary.id] === null) {
            return null;
        }
        let val = this.state[this.secondary.id];
        const Icon = this.secondary.icon;
        if (typeof val === 'number') {
            val = Math.round(val * 100) / 100;
        }
        return <div key={this.key + 'tile-secondary'} className={cls.tileTextSecond} title={this.secondary.title}>
            {Icon ? (<Icon className={cls.iconSecondary} />) : null}
            <span className={cls.textSecondary}>{val + this.secondary.unit}</span>
        </div>;
    }

    getSecondaryDivTop() {
        const state = this.state[this.id];
        let val;
        if (state === null) {
            val = '?';
        } else {
            val = Math.round(state * 100) / 100;
            if (this.commaAsDelimiter) {
                val = val.toString().replace('.', ',') + this.unit;
            } else {
                val = val + this.unit;
            }
        }
        return <div className={cls.temperature}>{val}</div>
    }

    render() {
        return this.wrapContent([
            this.getStandardContent(this.actualId),
            this.getSecondaryDiv(),
            this.getSecondaryDivTop(),
            this.getCharts()
        ]);
    }
}

export default SmartThermometer;

