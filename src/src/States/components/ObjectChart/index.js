import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import cls from './style.module.scss';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import LinearProgress from '@mui/material/LinearProgress';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';

import ReactEchartsCore from 'echarts-for-react/lib/core';

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';

import {
    GridComponent,
    ToolboxComponent,
    TooltipComponent,
    TitleComponent,
    TimelineComponent,
    LegendComponent,
    SingleAxisComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

import { Utils, withWidth } from '@iobroker/adapter-react-v5';

import frLocale from 'date-fns/locale/fr';
import ruLocale from 'date-fns/locale/ru';
import enLocale from 'date-fns/locale/en-US';
import esLocale from 'date-fns/locale/es';
import plLocale from 'date-fns/locale/pl';
import ptLocale from 'date-fns/locale/pt';
import itLocale from 'date-fns/locale/it';
import cnLocale from 'date-fns/locale/zh-CN';
import brLocale from 'date-fns/locale/pt-BR';
import deLocale from 'date-fns/locale/de';
import nlLocale from 'date-fns/locale/nl';

import moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/pl';
import 'moment/locale/pt';
import 'moment/locale/it';
import 'moment/locale/nl';
import 'moment/locale/ru';
import 'moment/locale/zh-cn';
import 'moment/locale/de';

// icons
import { FaChartLine as SplitLineIcon } from 'react-icons/fa';
import CustomSelect from '../CustomSelect';
import CustomFab from '../CustomFab';
import { Tooltip } from '@mui/material';
// import EchartsIcon from '../../assets/echarts.png';

echarts.use([SingleAxisComponent, LegendComponent, TimelineComponent, ToolboxComponent, TitleComponent, TooltipComponent, GridComponent, LineChart, SVGRenderer]);

const localeMap = {
    en: enLocale,
    fr: frLocale,
    ru: ruLocale,
    de: deLocale,
    es: esLocale,
    br: brLocale,
    nl: nlLocale,
    it: itLocale,
    pt: ptLocale,
    pl: plLocale,
    'zh-cn': cnLocale,
};

function padding3(ms) {
    if (ms < 10) {
        return '00' + ms;
    } else if (ms < 100) {
        return '0' + ms;
    } else {
        return ms;
    }
}

function padding2(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

const styles = theme => ({
    paper: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        width: '100%'
    },
    chart: {
        width: '100%',
        overflow: 'hidden',
    },
    chartWithToolbar: {
        height: `calc(100% - ${theme.mixins.toolbar.minHeight + parseInt(theme.spacing(1), 10)}px)`,
    },
    chartWithoutToolbar: {
        height: `100%`,
    },
    selectHistoryControl: {
        width: 130,
    },
    selectRelativeTime: {
        marginLeft: 10,
        width: 200,
    },
    notAliveInstance: {
        opacity: 0.5,
    },
    customRange: {
        color: theme.palette.primary.main
    },
    splitLineButtonIcon: {
        marginRight: theme.spacing(1),
    },
    splitLineButton: {
        float: 'right',
    },
    grow: {
        flexGrow: 1,
    },

    toolbarTime: {
        width: 100,
        marginTop: '4px !important',
        marginBottom: '4px !important',
        marginLeft: theme.spacing(1),
    },
    toolbarDate: {
        width: 160,
        marginTop: '4px !important',
        marginBottom: '4px !important',
    },
    toolbarTimeGrid: {
        marginLeft: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        border: '1px dotted #AAAAAA',
        borderRadius: theme.spacing(1),
    },
    buttonIcon: {
        width: 24,
        height: 24
    },
    echartsButton: {
        marginRight: theme.spacing(1),
        height: 34,
        width: 34,
    }
});

const GRID_PADDING_LEFT = 80;
const GRID_PADDING_RIGHT = 25;

const THEMES = [
    '#2ec7c9',
    '#b6a2de',
    '#5ab1ef',
    '#ffb980',
    '#d87a80',
    '#8d98b3',
    '#e5cf0d',
    '#97b552',
    '#95706d',
    '#dc69aa',
    '#07a2a4',
    '#9a7fd1',
    '#588dd5',
    '#f5994e',
    '#c05050',
    '#59678c',
    '#c9ab00',
    '#7eb00a',
    '#6f5553',
    '#c14089'
];


let canvasCalcTextWidth = null;
function calcTextWidth(text, fontSize, fontFamily) {
    // canvas for better performance
    const canvas = canvasCalcTextWidth || (canvasCalcTextWidth = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = `${fontSize || 12}px ${fontFamily || 'Microsoft YaHei'}`;
    const metrics = context.measureText(text);
    return Math.ceil(metrics.width);
}

class ObjectChart extends Component {
    constructor(props) {
        super(props);
        let from;
        if (!this.props.from) {
            from = new Date(this.props.from);
            from.setHours(from.getHours() - 24 * 7);
            this.start = from.getTime();
        } else {
            this.start = this.props.from
        }
        if (!this.props.end) {
            this.end = Date.now();
        } else {
            this.end = this.props.end;
        }
        let relativeRange = window.localStorage.getItem('App.relativeRange') || '30';
        let min = parseInt(window.localStorage.getItem('App.absoluteStart'), 10) || 0;
        let max = parseInt(window.localStorage.getItem('App.absoluteEnd'), 10) || 0;

        if ((!min || !max) && (!relativeRange || relativeRange === 'absolute')) {
            relativeRange = '30';
        }

        if (max && min) {
            relativeRange = 'absolute';
        }

        const maxYLen = {};

        this.state = {
            loaded: false,
            historyInstance: this.props.historyInstance || '',
            historyInstances: null,
            defaultHistory: '',
            chartHeight: 300,
            chartWidth: 500,
            relativeRange,
            splitLine: window.localStorage.getItem('App.splitLine') === 'true',
            dateFormat: 'dd.MM.yyyy',
            min,
            max,
            maxYLen,
        };

        this.echartsReact = createRef();
        this.readTimeout = null;

        this.chartValues = null;

        this.divRef = createRef();

        this.chart = {};

        this.lastFormattedTime = null;

        this.onChange = this.onChange.bind(this);
        this.onResize = this.onResize.bind(this);

        this.objectList = this.props.objs;
        if (!this.objectList) {
            this.objectList = [this.props.obj];
        }

        this.units = {};
        this.names = {};

        this.objectList.forEach(obj => {
            maxYLen[obj._id] = 0;
            this.units[obj._id] = obj.common?.unit ? ' ' + obj.common.unit : '';
            this.names[obj._id] = Utils.getObjectNameFromObj(obj, this.props.lang);
        });

        moment.locale(props.lang);
        this.selected = {};
        this.actualValues = null;
        this.isFloatComma = true;
    }

    componentDidMount() {
        this.objectList.forEach(obj =>
            this.props.socket.subscribeState(obj._id, this.onChange));

        window.addEventListener('resize', this.onResize);

        this.prepareData()
            .then(() => new Promise(resolve => this.updateChart(null, null, true, true, () => resolve())))
            .then(() => this.setRelativeInterval(this.state.relativeRange, true, () =>
                this.forceUpdate()));
    }

    componentWillUnmount() {
        this.readTimeout && clearTimeout(this.readTimeout);
        this.readTimeout = null;

        this.timeTimer && clearTimeout(this.timeTimer);
        this.timeTimer = null;

        this.maxYLenTimeout && clearTimeout(this.maxYLenTimeout);
        this.maxYLenTimeout = null;

        this.objectList.forEach(obj =>
            this.props.socket.unsubscribeState(obj._id, this.onChange));

        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        this.timerResize && clearTimeout(this.timerResize);
        this.timerResize = setTimeout(() => {
            this.timerResize = null;
            this.componentDidUpdate();
        });
    }

    onChange = (id, state) => {
        if (state) {
            this.actualValues = this.actualValues || {};
            this.actualValues[id] = state.val
        }
        if (this.objectList.find(obj => obj._id === id) &&
            state &&
            this.chartValues && this.chartValues[id] &&
            (!this.chartValues[id].length || this.chartValues[id][this.chartValues[id].length - 1].ts < state.ts)
        ) {
            this.chartValues[id] && this.chartValues[id].push({ val: state.val, ts: state.ts });

            // update only if end is near to now
            if (state.ts >= this.chart.min && state.ts <= this.chart.max + 300000) {
                this.updateChart();
            }
        }
    }

    prepareData() {
        let list;

        if (this.props.noToolbar) {
            return new Promise(resolve =>
                this.setState({
                    dateFormat: this.props.dateFormat.replace(/D/g, 'd').replace(/Y/g, 'y'),
                    defaultHistory: this.props.defaultHistory,
                    historyInstance: this.props.defaultHistory,
                }, () => resolve()));
        } else {
            return this.getHistoryInstances()
                .then(_list => {
                    list = _list;
                    // read default history
                    return this.props.socket.getSystemConfig();
                })
                .then(config => {
                    return (!this.props.showJumpToEchart ? Promise.resolve([]) : this.props.socket.getAdapterInstances('echarts'))
                        .then(instances => {
                            // collect all echarts instances
                            const echartsJump = !!instances.find(item => item._id.startsWith('system.adapter.echarts.'));

                            const defaultHistory = config?.common?.defaultHistory;
                            this.isFloatComma = config?.common?.isFloatComma || true;

                            // find current history
                            // first read from localstorage
                            let historyInstance = window.localStorage.getItem('App.historyInstance') || '';
                            if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                                // try default history
                                historyInstance = defaultHistory;
                            }
                            if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                                // find first alive history
                                historyInstance = list.find(it => it.alive);
                                if (historyInstance) {
                                    historyInstance = historyInstance.id;
                                }
                            }
                            // get first entry
                            if (!historyInstance && list.length) {
                                historyInstance = defaultHistory;
                            }

                            this.setState({
                                dateFormat: (config.common.dateFormat || 'dd.MM.yyyy').replace(/D/g, 'd').replace(/Y/g, 'y'),
                                historyInstances: list,
                                defaultHistory,
                                historyInstance,
                                echartsJump,
                            });
                        });
                });
        }
    }

    getHistoryInstances() {
        const list = [];
        const ids = [];

        if (this.props.historyInstance) {
            return Promise.resolve(list);
        }

        this.props.customsInstances.forEach(instance => {
            const instObj = this.props.objects['system.adapter.' + instance];
            if (instObj && instObj.common && instObj.common.getHistory) {
                let listObj = { id: instance, alive: false };
                list.push(listObj);
                ids.push(`system.adapter.${instance}.alive`);
            }
        });

        if (ids.length) {
            return this.props.socket.getForeignStates(ids)
                .then(alives => {
                    Object.keys(alives).forEach(id => {
                        const item = list.find(it => id.endsWith(it.id + '.alive'));
                        if (item) {
                            item.alive = alives[id] && alives[id].val;
                        }
                    });
                    return list;
                });
        } else {
            return Promise.resolve(list);
        }
    }

    readHistories(start, end) {
        return Promise.all(this.objectList.map(obj => this.readHistory(obj._id, start, end)))
            .then(() => this.chartValues);
    }

    readHistory(id, start, end) {
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
        const options = {
            instance: this.state.historyInstance,
            start,
            end,
            from: false,
            ack: false,
            q: false,
            addID: false,
            aggregate: 'none'
        };

        if (end - start > 60000 * 24 &&
            !(this.props.obj.common.type === 'boolean' || (this.props.obj.common.type === 'number' && this.props.obj.common.states))) {
            options.aggregate = 'minmax';
            //options.step = 60000;
        }

        return this.props.socket.getHistory(id, options)
            .then(values => {
                let chart = [];
                let r = 0;
                let minY = null;
                let maxY = null;

                for (let t = 0; t < values.length; t++) {
                    // if range and details are not equal
                    if (!chart.length || chart[chart.length - 1].ts < values[t].ts) {
                        chart.push(values[t]);
                        //console.log(`add value ${new Date(values[t].ts).toISOString()}: ${values[t].val}`)
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

                // sort
                chart.sort((a, b) => a.ts > b.ts ? 1 : (a.ts < b.ts ? -1 : 0));

                this.chartValues = this.chartValues || {};
                this.chartValues[id] = chart;
                this.minY = this.minY || {};
                this.maxY = this.maxY || {};

                this.minY[id] = minY;
                this.maxY[id] = maxY;

                if (this.minY[id] < 10) {
                    this.minY[id] = Math.round(this.minY[id] * 10) / 10;
                } else {
                    this.minY[id] = Math.ceil(this.minY[id]);
                }
                if (this.maxY[id] < 10) {
                    this.maxY[id] = Math.round(this.maxY[id] * 10) / 10;
                } else {
                    this.maxY[id] = Math.ceil(this.maxY[id]);
                }
                return chart;
            });
    }

    convertData(id, values) {
        values = values || this.chartValues[id];
        const data = [];
        if (!values || !values.length) {
            return data;
        }
        for (let i = 0; i < values.length; i++) {
            data.push({ value: [values[i].ts, values[i].val] });
        }
        if (!this.chart.min) {
            this.chart.min = values[0].ts;
            this.chart.max = values[values.length - 1].ts;
        }

        return data;
    }

    xFormatter(value, _index) {
        const date = new Date(value);
        let dateTxt = '';
        const dateInMonth = date.getDate();
        if (this.withSeconds || this.withTime) {
            let showDate = false;
            if (_index < 2 || this.lastFormattedTime === null || value < this.lastFormattedTime) {
                showDate = true;
            } else
                if (!showDate && new Date(this.lastFormattedTime).getDate() !== dateInMonth) {
                    showDate = true;
                }
            if (showDate) {
                dateTxt = `{b|..}\n{a|${padding2(dateInMonth)}.${padding2(date.getMonth() + 1)}.}`;
            }
            this.lastFormattedTime = value;
            if (this.withSeconds) {
                return padding2(date.getHours()) + ':' + padding2(date.getMinutes()) + ':' + padding2(date.getSeconds()) + dateTxt;
            } else if (this.withTime) {
                return padding2(date.getHours()) + ':' + padding2(date.getMinutes()) + dateTxt;
            }
        } else {
            return padding2(dateInMonth) + '.' + padding2(date.getMonth() + 1) + '\n' + date.getFullYear();
        }
    }

    getYAxis(obj, i, isBoolean) {
        return {
            type: 'value',
            _boolean: isBoolean,
            _unit: this.units[obj._id],
            boundaryGap: [0, '100%'],
            position: 'left',
            splitLine: {
                show: this.props.noToolbar || !!this.state.splitLine
            },
            splitNumber: Math.round(this.state.chartHeight / 50),
            axisLabel: {
                formatter: value => this.yFormatter(value, obj, true),
                showMaxLabel: true,
                showMinLabel: true,
                color: THEMES[i]
            },
            axisTick: {
                alignWithLabel: true,
                show: true,
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: THEMES[i]
                }
            },
        };
    }

    // result.val === null => start and end are null
    // result === null => no start or no end
    getInterpolatedValue(i, ts, type, states, hoverNoNulls) {
        const data = this.option.series[i].data;
        if (!data || !data[0] || data[0].value[0] > ts || data[data.length - 1].value[0] < ts) {
            return null;
        }

        for (let k = 0; k < data.length - 1; k++) {
            if (data[k].value[0] === ts) {
                // Calculate
                return { exact: true, val: data[k].value[1] };
            } else if (data[k].value[0] < ts && ts < data[k + 1].value[0]) {
                const y1 = data[k].value[1];
                const y2 = data[k + 1].value[1];
                if (y2 === null || y2 === undefined || y1 === null || y1 === undefined) {
                    return hoverNoNulls ? null : { exact: false, val: null };
                }
                if (type === 'boolean' || (type === 'number' && states)) {
                    return { exact: false, val: y1 };
                }

                // interpolate
                const diff = data[k + 1].value[0] - data[k].value[0];
                const kk = (data[k + 1].value[0] - ts) / diff;
                return { exact: false, val: (1 - kk) * (y2 - y1) + y1 };
            }
        }
        return hoverNoNulls ? null : { exact: false, val: null };
    }

    yFormatter(val, obj, withUnit, interpolated, ignoreWidth) {
        if (obj.common.type === 'boolean') {
            return val ? 'TRUE' : 'FALSE';
        } else if (obj.common.type === 'number' && obj.common.states) {
            return obj.common.states[val] !== undefined ? obj.common.states[val] : val;
        }

        if (val === null || val === undefined) {
            return '';
        }

        /*const afterComma = null;
        if (afterComma !== undefined && afterComma !== null) {
            val = parseFloat(val);
            if (this.isFloatComma) {
                return val.toFixed(afterComma).replace('.', ',') + (withUnit ? this.config.l[line].unit : '');
            } else {
                return val.toFixed(afterComma) + (withUnit ? this.config.l[line].unit : '');
            }
        } else {*/
        if (interpolated) {
            val = Math.round(val * 10000) / 10000;
        }
        let text;
        if (this.isFloatComma) {
            val = parseFloat(val) || 0;
            val = val.toString().replace('.', ',');
            text = val + (withUnit ? this.units[obj._id] : '');
        } else {
            val = val.toString();
            text = val + (withUnit ? this.units[obj._id] : '');
        }
        if (!ignoreWidth && this.state.maxYLen[obj._id] < val.length) {
            this.maxYLenTimeout && clearTimeout(this.maxYLenTimeout);
            this.maxYLenTimeout = setTimeout((_maxYLen, id) => {
                this.maxYLenTimeout = null;
                const maxYLen = JSON.parse(JSON.stringify(this.state.maxYLen));
                maxYLen[id] = _maxYLen;
                this.setState({ maxYLen });
            }, 200, val.length, obj._id);
        }
        //}
        return text;
    }

    renderTooltip(params) {
        const ts = params[0].value[0];
        const date = new Date(ts);

        const values = this.objectList.map((obj, i) => {
            const p = params.find(param => param.seriesIndex === i);
            let interpolated;
            if (p) {
                interpolated = { exact: p.data.exact !== undefined ? p.data.exact : true, val: p.value[1] };
            }

            interpolated = interpolated || this.getInterpolatedValue(i, ts, obj.common.type, obj.common.states, false);
            if (!interpolated) {
                return '';
            }
            /*if (!interpolated.exact && this.config.hoverNoInterpolate) {
                return '';
            }*/

            const val = interpolated.val === null ?
                'null' :
                this.yFormatter(interpolated.val, obj, false, true || !interpolated.exact, true);

            return `<div style="width: 100%; display: inline-flex; justify-content: space-around; color: ${THEMES[i]}">` +
                `<div style="display: flex;margin-right: 4px">${this.names[obj._id]}:</div>` +
                `<div style="display: flex; flex-grow: 1"></div>` +
                `<div style="display: flex;">${interpolated.exact ? '' : 'i '}<b>${val}</b>${interpolated.val !== null ? this.units[obj._id] : ''}</div>` +
                `</div>`;
        });

        const format = 'dd, MM Do YYYY, HH:mm:ss.SSS';
        return `<b>${moment(date).format(format)}</b><br/>${values.filter(t => t).join('<br/>')}`;
    }

    getOption() {
        let widthAxisLeft = 0;
        let widthAxisRight = [];

        const diff = this.state.max - this.state.min;
        this.withTime = diff < 3600000 * 24 * 7;
        this.withSeconds = diff < 60000 * 30;

        const yAxis = [];

        const series = this.objectList.map((obj, i) => {
            let _yAxis = null;
            const id = obj._id;
            let yAxisIndex = i;
            let position;

            if (obj.common.type === 'boolean') {
                // find boolean axis
                const axis = yAxis.find(axis => axis && axis._boolean);
                if (axis) {
                    yAxisIndex = yAxis.indexOf(axis);
                    position = axis.position;
                } else {
                    _yAxis = this.getYAxis(obj, i, true);
                    if (yAxis.filter(axis => axis).length) {
                        _yAxis.position = 'right';
                    }
                    _yAxis.axisLabel.showMaxLabel = false;
                    _yAxis.axisLabel.formatter = value => value === 1 ? 'TRUE' : 'FALSE';
                    _yAxis.max = 1.5;
                    _yAxis.interval = 1;
                    position = _yAxis.position;

                }
                if (position === 'left') {
                    if (widthAxisLeft < 50) {
                        widthAxisLeft = 50;
                    }
                } else {
                    if (!widthAxisRight[i] || widthAxisRight[i] < 50) {
                        widthAxisRight[i] = 50;
                    }
                }
            } else {
                const axis = this.units[id] && yAxis.find(axis => axis && axis._unit && axis._unit === this.units[id]);
                if (axis) {
                    yAxisIndex = yAxis.indexOf(axis);
                    position = axis.position;
                } else {
                    _yAxis = this.getYAxis(obj, i);
                    if (yAxis.filter(axis => axis).length) {
                        _yAxis.position = 'right';
                    }
                    if (obj.common.type === 'number' && obj.common.states) {
                        _yAxis.axisLabel.showMaxLabel = false;
                        _yAxis.axisLabel.formatter = value => obj.common.states[value] !== undefined ? obj.common.states[value] : value;
                        const keys = Object.keys(obj.common.states);
                        keys.sort();
                        _yAxis.max = parseFloat(keys[keys.length - 1]) + 0.5;
                        _yAxis.interval = 1;
                    }
                    position = _yAxis.position;
                }

                if (obj.common.type === 'number' && obj.common.states) {
                    const keys = Object.keys(obj.common.states);
                    let max = '';
                    for (let i = 0; i < keys.length; i++) {
                        if (typeof obj.common.states[keys[i]] === 'string' && obj.common.states[keys[i]].length > max.length) {
                            max = obj.common.states[keys[i]];
                        }
                    }

                    if (position === 'left') {
                        const w = calcTextWidth(max);
                        if (w > widthAxisLeft) {
                            widthAxisLeft = w;
                        }
                    } else {
                        const w = calcTextWidth(max);
                        if (w > widthAxisRight[i]) {
                            widthAxisRight[i] = w;
                        }
                    }
                } else
                if (position === 'left') {
                    if (this.minY[id] !== null && this.minY[id] !== undefined) {
                        const w = calcTextWidth(this.minY[id].toString() + this.units[id]);
                        if (w > widthAxisLeft) {
                            widthAxisLeft = w;
                        }
                    }
                    if (this.maxY[id] !== null && this.maxY[id] !== undefined) {
                        const w = calcTextWidth(this.maxY[id].toString() + this.units[id]);
                        if (w > widthAxisLeft) {
                            widthAxisLeft = w;
                        }
                    }
                    if (this.state.maxYLen[id]) {
                        const w = calcTextWidth(''.padStart(this.state.maxYLen[id], '2') + this.units[id]);
                        if (w > widthAxisLeft) {
                            widthAxisLeft = w;
                        }
                    }
                } else {
                    if (this.minY[id] !== null && this.minY[id] !== undefined) {
                        const w = calcTextWidth(this.minY[id].toString() + this.units[id]);
                        if (!widthAxisRight[i] || w > widthAxisRight[i]) {
                            widthAxisRight[i] = w;
                        }
                    }
                    if (this.maxY[id] !== null && this.maxY[id] !== undefined) {
                        const w = calcTextWidth(this.maxY[id].toString() + this.units[id]);
                        if (!widthAxisRight[i] || w > widthAxisRight[i]) {
                            widthAxisRight[i] = w;
                        }
                    }
                    if (this.state.maxYLen[id]) {
                        const w = calcTextWidth(''.padStart(this.state.maxYLen[id], '0'));
                        if (!widthAxisRight[i] || w > widthAxisRight[i]) {
                            widthAxisRight[i] = w;
                        }
                    }
                }
            }

            yAxis.push(_yAxis);

            return {
                name: this.names[obj._id],
                yAxisIndex: yAxisIndex,
                type: 'line',
                step: obj.common.type === 'boolean' || (obj.common.type === 'number' && obj.common.states) ? 'end' : undefined,
                showSymbol: false,
                hoverAnimation: true,
                animation: false,
                data: this.convertData(obj._id),
                itemStyle: { color: THEMES[i] },
                lineStyle: {
                    color: THEMES[i],
                    width: 2,
                },
                emphasis: {
                    scale: false,
                    focus: 'none',
                    blurScope: 'none',
                    lineStyle: {
                        color: THEMES[i],
                        width: 2,
                    },
                },
                areaStyle: this.objectList.length === 1 ? {} : undefined
            };
        });

        let rightOffset = 0;
        yAxis.forEach((axis, i) => {
            if (axis && axis.position === 'right') {
                axis.offset = rightOffset;
                rightOffset += widthAxisRight[i] + 20;
            }
        });

        this.option = {
            legend: {
                data: this.objectList.map(obj => this.names[obj._id]),
                show: this.objectList.length > 1,
                backgroundColor: this.props.themeType === 'dark' ? '#FFFFFF10' : '#00000010',
                selected: {},
                orient: 'vertical',
                left: (widthAxisLeft ? widthAxisLeft + 5 : GRID_PADDING_LEFT) + 10,
                formatter: (name, arg) => {
                    if (this.actualValues) {
                        const id = Object.keys(this.names).find(id => this.names[id] === name);
                        if (id && this.actualValues[id] !== undefined) {
                            const obj = this.objectList.find(obj => obj._id === id);
                            return `${name} [${this.yFormatter(this.actualValues[id], obj, true, true, true)}]`;
                        }
                    }
                    return name;
                },
            },
            backgroundColor: 'transparent',
            title: {
                show: this.objectList.length === 1,
                text: this.props.noToolbar ? '' : this.names[this.objectList[0]._id],
                padding: [
                    10, // up
                    0,  // right
                    0,  // down
                    widthAxisLeft ? widthAxisLeft + 10 : GRID_PADDING_LEFT + 10, // left
                ]
            },
            grid: {
                left: widthAxisLeft ? widthAxisLeft + 10 : GRID_PADDING_LEFT,
                top: 8,
                right: (rightOffset ? rightOffset + 10 : 0) + (this.props.noToolbar ? 5 : GRID_PADDING_RIGHT),
                bottom: 40,
            },
            tooltip: {
                trigger: 'axis',
                hoverAnimation: true,
                formatter: params => this.renderTooltip(params),
                axisPointer: {
                    animation: true
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                },
                splitNumber: this.withSeconds ? Math.round((this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT) / 60) : Math.round((this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT) / 50),
                min: this.chart.min,
                max: this.chart.max,
                axisTick: { alignWithLabel: true, },
                axisLabel: {
                    formatter: this.xFormatter.bind(this),/*(value, index) => {
                        const date = new Date(value);
                        if (this.chart.withSeconds) {
                            return padding2(date.getHours()) + ':' + padding2(date.getMinutes()) + ':' + padding2(date.getSeconds());
                        } else if (this.chart.withTime) {
                            return padding2(date.getHours()) + ':' + padding2(date.getMinutes()) + '\n' + padding2(date.getDate()) + '.' + padding2(date.getMonth() + 1);
                        } else {
                            return padding2(date.getDate()) + '.' + padding2(date.getMonth() + 1) + '\n' + date.getFullYear();
                        }
                    }*/
                    rich: {
                        a: {
                            fontWeight: 'bold',
                        },
                        b: {
                            opacity: 0,
                        },
                    }
                }
            },
            yAxis,
            toolbox: {
                left: 'right',
                feature: this.props.noToolbar ? undefined : {
                    saveAsImage: {
                        title: this.props.t('Save as image'),
                        show: true,
                    }
                }
            },
            series
        };

        return this.option;
    }

    static getDerivedStateFromProps(props, state) {
        return null;
    }

    updateChart(start, end, withReadData, noWait, cb) {
        if (start) {
            this.start = start;
        }
        if (end) {
            this.end = end;
        }
        start = start || this.start;
        end = end || this.end;

        this.readTimeout && clearTimeout(this.readTimeout);

        this.readTimeout = setTimeout(() => {
            this.readTimeout = null;

            const diff = this.chart.max - this.chart.min;
            if (diff !== this.chart.diff) {
                this.chart.diff = diff;
                this.chart.withTime = this.chart.diff < 3600000 * 24 * 7;
                this.chart.withSeconds = this.chart.diff < 60000 * 30;
            }

            if (withReadData || !this.chartValues) {
                this.readHistories(start, end)
                    .then(values => {
                        values && this.echartsReact && typeof this.echartsReact.getEchartsInstance === 'function' && this.echartsReact.getEchartsInstance().setOption({
                            series: this.objectList.map(obj => ({ data: this.convertData(obj._id, values[obj._id]) })),
                            xAxis: {
                                min: this.chart.min,
                                max: this.chart.max,
                            }
                        });
                        cb && cb();
                    });
            } else {
                this.echartsReact && typeof this.echartsReact.getEchartsInstance === 'function' && this.echartsReact.getEchartsInstance().setOption({
                    series: this.objectList.map(obj => ({ data: this.convertData(obj._id) })),
                    xAxis: {
                        min: this.chart.min,
                        max: this.chart.max,
                    }
                });
                cb && cb();
            }
        }, noWait ? 0 : 400);
    }

    setNewRange(readData) {
        this.chart.diff = this.chart.max - this.chart.min;
        this.chart.withTime = this.chart.diff < 3600000 * 24 * 7;
        this.chart.withSeconds = this.chart.diff < 60000 * 30;

        if (this.state.relativeRange !== 'absolute') {
            this.setState({ relativeRange: 'absolute' });
        } else {
            this.echartsReact.getEchartsInstance().setOption({
                xAxis: {
                    min: this.chart.min,
                    max: this.chart.max,
                }
            });

            readData && this.updateChart(this.chart.min, this.chart.max, true);
        }
    }

    shiftTime() {
        const now = new Date();
        const delay = 60000 - now.getSeconds() - (1000 - now.getMilliseconds());

        if (now.getMilliseconds()) {
            now.setMilliseconds(1000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        const max = now.getTime();
        let min;
        let mins = this.state.relativeRange;

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            min = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 1);
            } else {
                now.setDate(now.getDate() - 6);
            }

            this.chart.min = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 8);
            } else {
                now.setDate(now.getDate() - 13);
            }
            this.chart.min = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            min = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            now.setMonth(0);
            min = now.getTime();
        } else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            min = now.getTime();
        } else {
            mins = parseInt(mins, 10);
            min = max - mins * 60000;
        }

        this.chart.min = min;
        this.chart.max = max;

        this.setState({ min, max }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));

        this.timeTimer = setTimeout(() => {
            this.timeTimer = null;
            this.shiftTime();
        }, delay || 60000);
    }

    setRelativeInterval(mins, dontSave, cb) {
        if (!dontSave) {
            window.localStorage.setItem('App.relativeRange', mins);
            this.setState({ relativeRange: mins });
        }
        if (mins === 'absolute') {
            this.timeTimer && clearTimeout(this.timeTimer);
            this.timeTimer = null;
            return;
        } else {
            window.localStorage.removeItem('App.absoluteStart');
            window.localStorage.removeItem('App.absoluteEnd');
        }

        const now = new Date();

        if (!this.timeTimer) {
            const delay = 60000 - now.getSeconds() - (1000 - now.getMilliseconds());
            this.timeTimer = setTimeout(() => {
                this.timeTimer = null;
                this.shiftTime();
            }, delay || 60000);
        }

        if (now.getMilliseconds()) {
            now.setMilliseconds(1000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        this.chart.max = now.getTime();

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            this.chart.min = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 1);
            } else {
                now.setDate(now.getDate() - 6);
            }

            this.chart.min = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            // find week start
            if (now.getDay()) { // if not sunday
                now.setDate(now.getDate() - now.getDay() - 8);
            } else {
                now.setDate(now.getDate() - 13);
            }
            this.chart.min = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            this.chart.min = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setDate(1);
            now.setMonth(0);
            this.chart.min = now.getTime();
        } else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setFullYear(now.getFullYear() - 1);
            this.chart.min = now.getTime();
        } else {
            mins = parseInt(mins, 10);
            this.chart.min = this.chart.max - mins * 60000;
        }

        this.setState({ min: this.chart.min, max: this.chart.max }, () =>
            this.updateChart(this.chart.min, this.chart.max, true, false, cb));
    }

    installEventHandlers() {
        const zr = this.echartsReact.getEchartsInstance().getZr();
        if (!zr._iobInstalled) {
            zr._iobInstalled = true;
            zr.on('mousedown', e => {
                this.mouseTimer = setTimeout(() => {
                    console.log('mouse down');
                    this.mouseTimer = null;
                    this.mouseDown = true;
                    this.chart.lastX = e.offsetX;
                }, 50);
            });
            zr.on('mouseup', () => {
                console.log(`mouse up ${Date.now() - this.lastSelectTime}`);
                if (this.mouseDown && !this.lastSelectTime || Date.now() - this.lastSelectTime > 300) {
                    this.mouseDown = false;
                    this.setNewRange(true);
                }
            });
            zr.on('mousewheel', e => {
                let diff = this.chart.max - this.chart.min;
                const width = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;
                const x = e.offsetX - GRID_PADDING_LEFT;
                const pos = x / width;

                const oldDiff = diff;
                const amount = e.wheelDelta > 0 ? 1.1 : 0.9;
                diff = diff * amount;
                const move = oldDiff - diff;
                this.chart.max += move * (1 - pos);
                this.chart.min -= move * pos;

                this.setNewRange();
            });
            zr.on('mousemove', e => {
                if (this.mouseDown) {
                    const moved = this.chart.lastX - (e.offsetX - GRID_PADDING_LEFT);
                    this.chart.lastX = e.offsetX - GRID_PADDING_LEFT;
                    const diff = this.chart.max - this.chart.min;
                    const width = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                    const shift = Math.round(moved * diff / width);
                    this.chart.min += shift;
                    this.chart.max += shift;
                    this.setNewRange();
                }
            });

            zr.on('touchstart', e => {
                e.preventDefault();
                this.mouseDown = true;
                const touches = e.touches || e.originalEvent.touches;
                if (touches) {
                    this.chart.lastX = touches[touches.length - 1].pageX;
                    if (touches.length > 1) {
                        this.chart.lastWidth = Math.abs(touches[0].pageX - touches[1].pageX);
                    } else {
                        this.chart.lastWidth = null;
                    }
                }
            });
            zr.on('touchend', e => {
                e.preventDefault();
                this.mouseDown = false;
                this.setNewRange(true);
            });
            zr.on('touchmove', e => {
                e.preventDefault();
                const touches = e.touches || e.originalEvent.touches;
                if (!touches) {
                    return;
                }
                const pageX = touches[touches.length - 1].pageX - GRID_PADDING_LEFT;
                if (this.mouseDown) {
                    if (touches.length > 1) {
                        // zoom
                        const fingerWidth = Math.abs(touches[0].pageX - touches[1].pageX);
                        if (this.chart.lastWidth !== null && fingerWidth !== this.chart.lastWidth) {
                            let diff = this.chart.max - this.chart.min;
                            const chartWidth = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                            const amount = fingerWidth > this.chart.lastWidth ? 1.1 : 0.9;
                            const positionX = touches[0].pageX > touches[1].pageX ?
                                touches[1].pageX - GRID_PADDING_LEFT + fingerWidth / 2 :
                                touches[0].pageX - GRID_PADDING_LEFT + fingerWidth / 2;

                            const pos = positionX / chartWidth;

                            const oldDiff = diff;
                            diff = diff * amount;
                            const move = oldDiff - diff;

                            this.chart.max += move * (1 - pos);
                            this.chart.min -= move * pos;

                            this.setNewRange();
                        }
                        this.chart.lastWidth = fingerWidth;
                    } else {
                        // swipe
                        const moved = this.chart.lastX - pageX;
                        const diff = this.chart.max - this.chart.min;
                        const chartWidth = this.state.chartWidth - GRID_PADDING_RIGHT - GRID_PADDING_LEFT;

                        const shift = Math.round(moved * diff / chartWidth);
                        this.chart.min += shift;
                        this.chart.max += shift;

                        this.setNewRange();
                    }
                }
                this.chart.lastX = pageX;
            });
        }
    }

    applySelected() {
        // merge selected
        if (this.selected && this.option.legend) {
            Object.keys(this.selected).forEach(name => this.option.legend.selected[name] = this.selected[name]);
        }
    }

    renderChart() {
        if (this.chartValues) {
            this.getOption();
            this.applySelected();

            return <ReactEchartsCore
                ref={e => this.echartsReact = e}
                echarts={echarts}
                option={this.option}
                notMerge={true}
                lazyUpdate={true}
                theme={this.props.themeType === 'dark' ? 'dark' : ''}
                style={{ height: this.state.chartHeight + 'px', width: '100%' }}
                opts={{ renderer: 'svg' }}
                onChartReady={() => {
                    this.echartsReact &&
                    this.chartValues && typeof this.echartsReact.getEchartsInstance === 'function' &&
                    this.echartsReact.getEchartsInstance().setOption({
                        series: this.objectList.map(obj => ({ data: this.convertData(obj._id) })),
                        xAxis: {
                            min: this.chart.min,
                            max: this.chart.max,
                        }
                    });
                }}
                onEvents={{
                    rendered: e => {
                        this.objectList.length === 1 && this.installEventHandlers();
                    },
                    legendselectchanged: e => {
                        this.lastSelectTime = Date.now();
                        console.log('Legend select');
                        this.mouseTimer && clearTimeout(this.mouseTimer);
                        this.mouseTimer = null;
                        this.selected = JSON.parse(JSON.stringify(e.selected));
                    },
                }}
            />;
        } else {
            return <LinearProgress />;
        }
    }

    componentDidUpdate() {
        if (this.divRef.current) {
            const width = this.divRef.current.offsetWidth;
            const height = this.divRef.current.offsetHeight;
            if (this.state.chartHeight !== height) {// || this.state.chartHeight !== height) {
                setTimeout(() => this.setState({ chartHeight: height, chartWidth: width }), 100);
            }
        }
    }

    setStartDate(min) {
        min = min.getTime();
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = null;
        }
        window.localStorage.setItem('App.relativeRange', 'absolute');
        window.localStorage.setItem('App.absoluteStart', min);
        window.localStorage.setItem('App.absoluteEnd', this.state.max);

        this.chart.min = min;
        this.setState({ min, relativeRange: 'absolute' }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));
    }

    setEndDate(max) {
        max = max.getTime();
        window.localStorage.setItem('App.relativeRange', 'absolute');
        window.localStorage.setItem('App.absoluteStart', this.state.min);
        window.localStorage.setItem('App.absoluteEnd', max);
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = null;
        }
        this.chart.max = max;
        this.setState({ max, relativeRange: 'absolute' }, () =>
            this.updateChart(this.chart.min, this.chart.max, true));
    }

    openEcharts() {
        const args = [
            'id=' + window.encodeURIComponent(this.props.obj._id),
            'instance=' + window.encodeURIComponent(this.state.historyInstance),
            'menuOpened=false',
        ];

        if (this.state.relativeRange === 'absolute') {
            args.push('start=' + this.chart.min);
            args.push('end=' + this.chart.max);
        } else {
            args.push('range=' + this.state.relativeRange);
        }

        window.open(`${window.location.protocol}//${window.location.host}/adapter/echarts/tab.html#${args.join('&')}`, 'echarts');
    }

    renderToolbar() {
        if (this.props.noToolbar) {
            return null;
        }

        const classes = this.props.classes;

        return <Toolbar className={cls.wrapperMenu}>
            {!this.props.historyInstance && <FormControl className={classes.selectHistoryControl} variant="standard">
                <InputLabel>{this.props.t('History instance')}</InputLabel>
                <Select
                    variant="standard"
                    value={this.state.historyInstance}
                    onChange={e => {
                        window.localStorage.setItem('App.historyInstance', e.target.value);
                        this.setState({ historyInstance: e.target.value });
                    }}
                >
                    {this.state.historyInstances.map(it => <MenuItem key={it.id} value={it.id} className={Utils.clsx(!it.alive && classes.notAliveInstance)}>{it.id}</MenuItem>)}
                </Select>
            </FormControl>}
            <CustomSelect
                onChange={this.setRelativeInterval.bind(this)}
                customValue
                value={this.state.relativeRange}
                className={classes.selectRelativeTime}
                customOptions
                title="Relative"
                options={[
                    <MenuItem key={'custom'} value={'absolute'} className={classes.customRange}>{this.props.t('custom range')}</MenuItem>,
                    <MenuItem key={'1'} value={10}            >{this.props.t('last 10 minutes')}</MenuItem>,
                    <MenuItem key={'2'} value={30}            >{this.props.t('last 30 minutes')}</MenuItem>,
                    <MenuItem key={'3'} value={60}            >{this.props.t('last hour')}</MenuItem>,
                    <MenuItem key={'4'} value={'day'}         >{this.props.t('this day')}</MenuItem>,
                    <MenuItem key={'5'} value={24 * 60}       >{this.props.t('last 24 hours')}</MenuItem>,
                    <MenuItem key={'6'} value={'week'}        >{this.props.t('this week')}</MenuItem>,
                    <MenuItem key={'7'} value={24 * 60 * 7}   >{this.props.t('last week')}</MenuItem>,
                    <MenuItem key={'8'} value={'2weeks'}      >{this.props.t('this 2 weeks')}</MenuItem>,
                    <MenuItem key={'9'} value={24 * 60 * 14}  >{this.props.t('last 2 weeks')}</MenuItem>,
                    <MenuItem key={'10'} value={'month'}       >{this.props.t('this month')}</MenuItem>,
                    <MenuItem key={'11'} value={30 * 24 * 60}  >{this.props.t('last 30 days')}</MenuItem>,
                    <MenuItem key={'12'} value={'year'}        >{this.props.t('this year')}</MenuItem>,
                    <MenuItem key={'13'} value={'12months'}    >{this.props.t('last 12 months')}</MenuItem>
                ]}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeMap[this.props.lang]}>
                <div className={cls.toolbarTimeGrid}>
                    <DatePicker
                        className={cls.toolbarDate}
                        disabled={this.state.relativeRange !== 'absolute'}
                        disableToolbar
                        variant="inline"
                        margin="normal"
                        inputFormat={this.state.dateFormat}
                        //format="fullDate"
                        label={this.props.t('Start date')}
                        value={new Date(this.state.min)}
                        onChange={date => this.setStartDate(date)}
                        renderInput={params => <TextField className={this.props.classes.dateInput} variant="standard" {...params} />}
                    />
                    <TimePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={cls.toolbarTime}
                        margin="normal"
                        //format="fullTime24h"
                        ampm={false}
                        label={this.props.t('Start time')}
                        value={new Date(this.state.min)}
                        onChange={date => this.setStartDate(date)}
                        renderInput={params => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                    />
                </div>
                <div className={cls.toolbarTimeGrid}>
                    <DatePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={cls.toolbarDate}
                        disableToolbar
                        inputFormat={this.state.dateFormat}
                        variant="inline"
                        //format="fullDate"
                        margin="normal"
                        label={this.props.t('End date')}
                        value={new Date(this.state.max)}
                        onChange={date => this.setEndDate(date)}
                        renderInput={params => <TextField className={this.props.classes.dateInput} variant="standard" {...params} />}
                    />
                    <TimePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={cls.toolbarTime}
                        margin="normal"
                        //format="fullTime24h"
                        ampm={false}
                        label={this.props.t('End time')}
                        value={new Date(this.state.max)}
                        onChange={date => this.setEndDate(date)}
                        renderInput={params => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                    />
                </div>
            </LocalizationProvider>
            <div className={classes.grow} />
            {this.props.showJumpToEchart && this.state.echartsJump && <CustomFab
                className={classes.echartsButton}
                size="small"
                onClick={() => this.openEcharts()}
                title={this.props.t('Open charts in new window')}
            >
                <img src={EchartsIcon} alt="echarts" className={classes.buttonIcon} />
            </CustomFab>}
            <Tooltip title={this.props.t('Show lines')}>
                <Fab
                    variant="extended"
                    size="small"
                    // active={this.state.splitLine}
                    // title={this.props.t('Show lines')}
                    color={ this.state.splitLine ? 'primary' : 'inherit' }
                    aria-label="show lines"
                    onClick={() => {
                        window.localStorage.setItem('App.splitLine', this.state.splitLine ? 'false' : 'true');
                        this.setState({ splitLine: !this.state.splitLine });
                    }}
                    className={classes.splitLineButton}
                >
                    <SplitLineIcon />
                    {/* { this.props.t('Show lines') } */}
                </Fab>
            </Tooltip>
        </Toolbar>;
    }

    render() {
        if (!this.state.historyInstance && !this.state.defaultHistory) {
            return <LinearProgress />;
        }

        return <div className={this.props.classes.paper}>
            {this.renderToolbar()}
            <div ref={this.divRef} className={Utils.clsx(this.props.classes.chart, this.props.noToolbar ? this.props.classes.chartWithoutToolbar : this.props.classes.chartWithToolbar)}>
                {this.renderChart()}
            </div>
        </div>;
    }
}

ObjectChart.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    expertMode: PropTypes.bool,
    socket: PropTypes.object,
    obj: PropTypes.object,
    objs: PropTypes.array,
    customsInstances: PropTypes.array,
    themeType: PropTypes.string,
    objects: PropTypes.object,
    from: PropTypes.number,
    end: PropTypes.number,
    noToolbar: PropTypes.bool,
    defaultHistory: PropTypes.string,
    historyInstance: PropTypes.string,
    showJumpToEchart: PropTypes.bool,
};

export default withWidth()(withStyles(styles)(ObjectChart));