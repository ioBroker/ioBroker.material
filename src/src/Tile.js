import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-flexbox-grid';
import StateTypes from './States/Types';
import Paper from 'material-ui/Paper';
import IndicatorBar from './States/IndicatorBar';
import Utils from './Utils';

import StateSwitch from './States/Switch';
import StateInfo from './States/Info';
import StateButton from './States/Button';
import StateGeneric from './States/Generic';
import StateSlider from './States/Slider';

const style = {
    padding: '1em',
    margin: '0.3em',
    display: 'inline-block',
    width: '100%',
    overflow: 'hidden',
    opacity: 0.85,
    borderRadius: '0.5em',
    position: 'relative'
};

const ignoreStates = [
    'INHIBIT',
    'INSTALL_TEST',
    'DECISION_VALUE',
    'ON_TIME',
    'STOP',
    'ADJUSTING_COMMAND',
    'ADJUSTING_DATA'
];

const ignoreRoles = [
    /^button/,
    /^action/
];

const indicators = [
    'WORKING',
    'BATTERY',
    'DIRECTION',
    /ERROR-\d+_ALARM/,
    'ERROR'
];

const indicatorsAsState = [
    'indicator.motion',
    'indicator.fire',
    'indicator.alarm',
    'indicator.water'
];

class Tile extends Component {
    static propTypes = {
        id:          PropTypes.string.isRequired,
        objects:     PropTypes.object.isRequired,
        states:      PropTypes.object.isRequired,
        enumName:    PropTypes.string,
        channelInfo: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.channelInfo   = this.props.channelInfo || Tile.getChannelInfo(this.props.objects, this.props.id);
        this.enumFunctions = this.props.enumFunctions;
    }

    static getChannelInfo(objects, channelId) {
        if (!channelId) {
            return {main: ''};
        }
        if (!objects[channelId]) {
            return null;
        }
        if (objects[channelId] && objects[channelId].type === 'state') {
            return {main: channelId};
        }

        let regEx = new RegExp('^' + channelId + '\\.[^.]+$');
        let result = {
            states: [],
            indicators: [],
            main: null
        };

        let main = null;
        for (let id in objects) {
            if (objects.hasOwnProperty(id) &&
                regEx.test(id) &&
                objects[id].type === 'state' &&
                objects[id].common &&
                objects[id].common.type &&
                !Tile.isIgnoredState(id)
            ) {
                let role = objects[id].common.role;

                if (role && ignoreRoles.find(reg => reg.test(role))) {
                    continue;
                }

                // fix for homematic... What the states are that.
                if (id.match(/ERROR-\d+_ALARM/)) {
                    continue;
                }

                if (role && (role === 'switch' || role.match(/^(level\.)?blind$|^(level\.)?dimmer|^(level\.)?valve/))) {
                    result.main = id;
                    if (channelId.indexOf('456411') !== -1) {
                        console.log('main: ' + id);
                    }
                }
                if (role === 'state') {
                    main = id;
                    if (channelId.indexOf('456411') !== -1) {
                        console.log('main_: ' + id);
                    }
                }

                if (role &&
                    indicatorsAsState.indexOf(role) === -1 &&
                    (role.match(/^indicator\.?/) || !indicators.find(name => {
                        return typeof name === 'string' ? name === id : name.test(id)
                    }))) {
                    result.indicators.push(id);
                } else {
                    result.states.push(id);
                }
            }
        }
        result.main = result.main || main;

        if (!result.main) {
            // Try to detect by name
            result.main = result.states.find(id => {
                let name = id.split('.').pop().toLowerCase();
                return name === 'state' || name === 'level' || name === 'value';
            });
        }

        return result;
    }

    static isIgnoredState(id) {
        let pos = id.lastIndexOf('.');
        let name = id.substring(pos + 1);
        return (ignoreStates.indexOf(name) !== -1);
    }

    findFunctionEnum(id) {
        return this.enumFunctions.filter(enumId => this.props.objects[enumId].common.members.indexOf(id) !== -1);
    }

    checkEnum(enumIds, regEx) {
        return enumIds.find(enumId => {
            let name = enumId.split('.').pop();
            if (regEx.test(name)) {
                return true;
            }
            name = Utils.getObjectName(this.props.objects, enumId);
            return regEx.test(name);
        });
    }

    getObjectName(channelName) {
        return StateGeneric.getObjectName(this.props.objects, this.props.id, null, channelName, this.props.enumName);
    }

    wrapContent(content) {
        //<Col xs={12} sm={6} md={4} lg={3}>
        return (<Row>
            <Paper style={style} zDepth={1}>
                <span style={{display: 'none'}}>{this.props.id}</span>
                {content}
            </Paper>
        </Row>);
    }

    getItemType(id) {
        let item = this.props.objects[id];
        if (!item || !item.common) {
            return {type: StateTypes.unknown};
        }
        let role = item.common.role;

        if (role) {
            if (role.match(/^button/) || role.match(/^action/)) {
                return StateTypes.button;
            } else
            if (role.match(/\.light/) || role.match(/\.lighting/)) {
                let type;
                let channelInfo;
                if (item.type === 'channel') {
                    // find state
                    channelInfo = this.channelInfo;

                    if (channelInfo.main) {
                        type = this.props.objects[channelInfo.main].common.type;
                    }
                } else {
                    type = item.common.type;
                }
                if (type === 'number') {
                    return StateTypes.dimmer;
                } else {
                    return StateTypes.light;
                }
            } else
            if (role.match(/\.blind/) || role.match(/\.shutter/)) {
                return StateTypes.blind;
            } else
            if (role.match(/\.valve/)) {
                return StateTypes.valve;
            } else
            if (role.match(/\.temperature/)) {
                return StateTypes.temperature;
            } else
            if (role.match(/\.humidity/)) {
                return StateTypes.humidity;
            }
        }

        let channelId;
        if (item.type === 'state' && (!role || !role.match(/^switch/))) {
            // check channel
            let pos = id.lastIndexOf('.');
            channelId = id.substring(0, pos);
            let channelItem = this.props.objects[channelId];
            if (channelItem && channelItem.common && channelItem.common.role) {
                role = channelItem.common.role;
                if (role.match(/button/) || role.match(/action/)) {
                    return StateTypes.button;
                } else
                if (role.match(/dimmer/)) {
                    return StateTypes.light;
                } else
                if (role.match(/light/) || role.match(/lighting/)) {
                    return StateTypes.light;
                } else if (role.match(/blind/) || role.match(/shutter/)) {
                    return StateTypes.blind;
                } else if (role.match(/valve/)) {
                    return StateTypes.valve;
                }
            }
            pos = channelId.lastIndexOf('.');
            let deviceId = channelId.substring(0, pos);
            let deviceItem = this.props.objects[deviceId];
            if ((!role || !role.match(/^switch/)) && deviceItem && deviceItem.type === 'device' && deviceItem.common && deviceItem.common.role) {
                role = deviceItem.common.role;
                if (role.match(/button/) || role.match(/action/)) {
                    return StateTypes.button;
                } else
                if (role.match(/dimmer/)) {
                    return StateTypes.light;
                } else
                if (role.match(/light/) || role.match(/lighting/)) {
                    return StateTypes.light;
                } else if (role.match(/blind/) || role.match(/shutter/)) {
                    return StateTypes.blind;
                } else if (role.match(/valve/)) {
                    return StateTypes.valve;
                }
            }
        }

        // check enumerations
        let funcs = this.findFunctionEnum(id);
        if (!funcs.length && item.type === 'state') {
            funcs = this.findFunctionEnum(channelId);
        }
        if (this.checkEnum(funcs, /lighting|beleuchtung|lamp|лампа|лампы|подсветка|освещение|свет|light|licht/i)) {
            let type;
            if (item.type === 'channel') {
                // find state
                if (this.channelInfo.main) {
                    type = this.props.objects[this.channelInfo.main].common.type;
                }
            } else {
                type = item.common.type;
            }
            if (type === 'number') {
                return StateTypes.dimmer;
            } else {
                return StateTypes.light;
            }
        }

        if (this.checkEnum(funcs, /blind|shutter|beschattung|rollladen|rolladen|жалюзи|ставни/i)) {
            return StateTypes.blind;
        }

        if (this.checkEnum(funcs, /door|tür|дверь/i)) {
            return StateTypes.door;
        }
        if (this.checkEnum(funcs, /windows?|fenster|окно|окна/i)) {
            return StateTypes.window;
        }
        if (role === 'switch') {
            return StateTypes.socket;
        }

        return StateTypes.unknown;
    }

    createControl(control, id, label, channelName, type) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={id}
            id={id}
            label={label || null}
            enumName={this.props.enumName}
            channelName={channelName}
            type={type}
            states={this.props.states}
            objects={this.props.objects}
            onCollectIds={(element, ids, isMount) => this.props.onCollectIds && this.props.onCollectIds(element, ids, isMount)}
            onControl={(id, val) => this.props.onControl && this.props.onControl(id, val)}
        />);
    }

    renderState(id, mainLabel, channelName) {
        let item;
        let type;
        if (id) {
            type = this.getItemType(id);

            if (type === StateTypes.unknown && mainLabel !== undefined && mainLabel !== null) {
                type = this.getItemType(this.props.id);
            }
            item = this.props.objects[id];
        }

        if (item && item.common.write) {
            switch (type) {
                case StateTypes.light:
                    if (item.common.type === 'number') {
                        return this.createControl(StateSlider, id, mainLabel, channelName, type);
                    } else {
                        return this.createControl(StateSwitch, id, mainLabel, channelName, type);
                    }

                case StateTypes.button:
                    return this.createControl(StateButton, id, mainLabel, channelName);

                case StateTypes.blind:
                    return this.createControl(StateSlider, id, mainLabel, channelName, type);

                case StateTypes.dimmer:
                    return this.createControl(StateSlider, id, mainLabel, channelName, type);

                default:
                    if (item.common.type === 'number') {
                        return this.createControl(StateSlider, id, mainLabel, channelName, StateTypes.unknown);
                    } else {
                        return this.createControl(StateSwitch, id, mainLabel, channelName, StateTypes.unknown);
                    }
            }
            // controllable
            //      light
            //      blind
            //      socket
            //      valve
            //      rgb
            //      dimmer
            //      temperature
            //      lock
        } else {
            // status
            //      temperature
            //      voltage
            //      current
            //      wind speed
            //      wind direction
            //      motion
            //
            return this.createControl(StateInfo, id, mainLabel, channelName);
        }
    }

    renderIndicators(indicators) {
        return (<IndicatorBar
            key={this.props.id + '_indicators'}
            objects={this.props.objects}
            onCollectIds={(element, ids, isMount) => this.props.onCollectIds && this.props.onCollectIds(element, ids, isMount)}
            ids={indicators}
        />);
    }

    render() {
        if (!this.props.id) {
            return this.wrapContent(this.renderState());
        } else if (!this.props.objects[this.props.id]) {
            return null;
        } else
        if (this.props.objects[this.props.id].type === 'state') {
            return this.wrapContent(this.renderState(this.channelInfo.main, this.getObjectName()));
        } else {
            if (this.props.id.indexOf('411') !== -1) {
                console.log(this.channelInfo);
            }
            // calculate visible states
            let ids = this.channelInfo.states;
            let count = 0;
            if (ids && ids.length) {
                for (let s = 0; s < ids.length; s++) {
                    if (ids[s] && ids[s] !== this.channelInfo.main) {
                        count++;
                    }
                }
            }

            if (!count && !this.channelInfo.main) {
                return null;
            }

            let controls = [];

            if (this.channelInfo.indicators && this.channelInfo.indicators.length) {
                controls.push(this.renderIndicators(this.channelInfo.indicators));
            }

            let channelName = this.getObjectName(this.props.id);
            if (this.channelInfo.main) {
                controls.push(this.renderState(this.channelInfo.main, channelName, channelName));
            } else if (count > 1) {
                // Add channel name
                controls.push((<div key={this.props.id} style={{fontWeight: 'bold'}}>{channelName}</div>));
            }

            if (count) {
                for (let s = 0; s < ids.length; s++) {
                    if (ids[s] && ids[s] !== this.channelInfo.main) {
                        if (count === 1 && !this.channelInfo.main) {
                            controls.push(this.renderState(ids[s], channelName, channelName));
                        } else {
                            controls.push(this.renderState(ids[s], null, channelName));
                        }
                    }
                }
            }

            return this.wrapContent(controls);
        }
    }
}

export default Tile;

