import Theme            from '../theme';

import IconThermostat   from 'react-icons/lib/ti/thermometer';
import IconLamp         from 'react-icons/lib/ti/lightbulb';
import IconWorking      from 'react-icons/lib/ti/cog-outline';
import IconUnreach      from 'react-icons/lib/md/perm-scan-wifi';
import IconMaintain     from 'react-icons/lib/md/priority-high';
import IconLowbat       from 'react-icons/lib/md/battery-alert';
import IconBlind        from '../icons/jalousie.svg';

import Types from '../States/Types';

const patternWorking  = {role: /^indicator\.working$/,                 indicator: true,                                                        name: 'WORKING',            required: false, icon: IconWorking,    color: Theme.tile.tileIndicatorsIcons.working};
const patternUnreach  = {role: /^indicator(\.maintenance)?\.unreach$/, indicator: true,  type: 'boolean',                                      name: 'UNREACH',            required: false, icon: IconUnreach,    color: Theme.tile.tileIndicatorsIcons.unreach};
const patternLowbat   = {role: /^indicator(\.maintenance)?\.lowbat$/,  indicator: true,  type: 'boolean',                                      name: 'LOWBAT',             required: false, icon: IconLowbat,     color: Theme.tile.tileIndicatorsIcons.lowbat};
const patternMaintain = {role: /^indicator\.maintenance$/,             indicator: true,  type: 'boolean',                                      name: 'MAINTAIN',           required: false, icon: IconMaintain,   color: Theme.tile.tileIndicatorsIcons.maintain};

const patterns = {
    thermostat: {
        states: [
            {role: /^level\.temperature(\..*)?$/,          indicator: false,                                                       name: 'SET_TEMPERATURE',    required: true,  icon: IconThermostat, color: '#E5AC00'},
            {role: /^value\.temperature(\..*)?$/,          indicator: false,                                                       name: 'ACTUAL_TEMPERATURE', required: false, icon: IconThermostat, color: '#E5AC00'},
            {role: /^switch\.boost(\..*)?$/,               indicator: false,                                                       name: 'BOOST_MODE',         required: false, icon: IconThermostat, color: '#E5AC00'},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain
        ],
        icon: IconThermostat,
        type: Types.thermostat
    },
    blinds: {
        states: [
            {role: /^level(\.blind)?$/,                   indicator: false, type: 'number',  write: true, enums: roleOrEnumBlind, name: 'BLIND_SET',           required: true,  icon: IconBlind,       color: '#fffc03'},
            {role: /^value(\.blind)?$/,                   indicator: false, type: 'number',               enums: roleOrEnumBlind, name: 'BLIND_ACT',           required: false},
            {role: /^button\.stop$|^action\.stop$/,       indicator: false, type: 'boolean', write: true, enums: roleOrEnumBlind, name: 'BLIND_STOP',          required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain
        ],
        icon: IconBlind,
        type: Types.blind
    },
    dimmer: {
        states: [
            {role: /^level(\.dimmer)?$/,                   indicator: false, type: 'number',  write: true, enums: roleOrEnumLight, name: 'LAMP_SET',           required: true,  icon: IconLamp,       color: '#fffc03'},
            {role: /^value(\.dimmer)?$/,                   indicator: false, type: 'number',               enums: roleOrEnumLight, name: 'LAMP_ACT',           required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain
        ],
        icon: IconLamp,
        type: Types.dimmer
    },
    light: {
        states: [
            {role: /^switch(\.light)?$|^state$/,           indicator: false, type: 'boolean', write: true, enums: roleOrEnumLight, name: 'LAMP_SET',           required: true,  icon: IconLamp,       color: '#fffc03'},
            {role: /^switch(\.light)?$|^state$/,           indicator: false, type: 'boolean', write: true, enums: roleOrEnumLight, name: 'LAMP_ACT',           required: true,  icon: IconLamp,       color: '#fffc03'},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain
        ],
        icon: IconLamp,
        type: Types.light
    }
};

const lightWords = {
    en: [/lights?/i,    /lamps?/i,      /ceilings?/i],
    de: [/licht(er)?/i, /lampen?/i,     /beleuchtung(en)?/],
    ru: [/свет/i,       /ламп[аы]/i,    /торшеры?/, /подсветк[аи]/i, /лампочк[аи]/i, /светильники?/i]
};

const blindWords = {
    en: [/blinds?/i,    /windows?/i,    /shutters?/i],
    de: [/rollladen?/i, /fenstern?/i,   /beschattung(en)?/],
    ru: [/ставни/i,     /рольставни/i,  /окна|окно/, /жалюзи/i]
};

function roleOrEnumLight(obj, enums) {
    if (obj.common.role === 'switch.light' || obj.common.role === 'dimmer') {
        return true;
    }
    let found = false;
    enums.forEach(en => {
        const pos = en.lastIndexOf('.');
        if (pos !== -1) {
            en = en.substring(pos + 1);
        }
        for (let lang in lightWords) {
            if (lightWords.hasOwnProperty(lang)) {
                if (lightWords[lang].find(reg => reg.test(en))) {
                    found = true;
                    return false;
                }
            }
        }
    });
    return found;
}

function roleOrEnumBlind(obj, enums) {
    if (obj.common.role === 'blind') {
        return true;
    }
    let found = false;
    enums.forEach(en => {
        const pos = en.lastIndexOf('.');
        if (pos !== -1) {
            en = en.substring(pos + 1);
        }
        for (let lang in blindWords) {
            if (blindWords.hasOwnProperty(lang)) {
                if (blindWords[lang].find(reg => reg.test(en))) {
                    found = true;
                    return false;
                }
            }
        }
    });
    return found;
}

class ChannelDetector {
    constructor(props, noSubscribe) {
        this.enums = null;
        this.cache = {};
    }

    static getAllStatesInChannel(keys, channelId) {
        let list = [];
        let reg = new RegExp('^' + channelId.replace(/\./g, '\\.') + '\\.[^.]+$');
        keys.forEach(_id => {
            if (reg.test(_id)) list.push(_id);
        });
        return list;
    }
    static getAllStatesInDevice(keys, channelId) {
        let list = [];
        let reg = new RegExp('^' + channelId.replace(/\./g, '\\.') + '\\.[^.]+\\.[^.]+$');
        keys.forEach(_id => {
            if (reg.test(_id)) list.push(_id);
        });
        return list;
    }

    static getFunctionEnums(objects) {
        let enums = [];
        const reg = /^enum\.functions\./;
        for (let id in objects) {
            if (objects.hasOwnProperty(id) && reg.test(id) && objects[id] && objects[id].type === 'enum' && objects[id].common && objects[id].common.members && objects[id].common.members.length) {
                enums.push(id);
            }
        }
        return enums;
    }

    static getParentId(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        } else {
            return id;
        }
    }

    _applyPattern(objects, id, statePattern) {
        if (objects[id] && objects[id].common) {
            if (statePattern.role && !statePattern.role.test(objects[id].common.role)) {
                return;
            }
            if (statePattern.write !== undefined && statePattern.write !== (objects[id].common.write || false)) {
                return;
            }
            if (statePattern.read !== undefined && statePattern.read !== (objects[id].common.read === undefined ? true : objects[id].common.read)) {
                return;
            }
            if (statePattern.type && statePattern.type !== objects[id].common.type) {
                return;
            }
            let enums = this.getEnumsForId(objects, id);

            if (statePattern.enums && typeof statePattern.enums === 'function' && (!enums || !enums.length || !statePattern.enums(objects[id], enums))) {
                return;
            }
            return true;
        } else {
            return false;
        }
    }

    getEnumsForId(objects, id) {
        this.enums = this.enums || ChannelDetector.getFunctionEnums(objects);
        let result = [];
        this.enums.forEach(e => {
            if (objects[e].common.members.indexOf(id) !== -1) {
                result.push(e);
            }
        });
        if (!result.length && objects[id] && objects[id].type === 'state') {
            const channel = ChannelDetector.getParentId(id);
            if (objects[channel] && (objects[channel].type === 'channel' || objects[channel].type === 'device')) {
                this.enums.forEach(e => {
                    if (objects[e].common.members.indexOf(channel) !== -1) {
                        result.push(e);
                    }
                });
            }
        }

        return result.length ? result : null;
    }

    detect(objects, keys, id) {
        if (this.cache[id]) {
            return this.cache[id];
        }

        if (!keys) {
            keys = Object.keys(objects);
            keys.sort();
        }
        if (objects[id] && objects[id].common) {
            let channelStates;

            if (objects[id].type === 'state') {
                channelStates = [id];
            } else {
                channelStates = ChannelDetector.getAllStatesInChannel(keys, id);
            }

            for (let pattern in patterns) {
                if (patterns.hasOwnProperty(pattern)) {
                    let result = null;
                    if (id.indexOf('hm-rpc.0.HEQ0066171') !== -1) {
                        console.log('AAA');
                    }

                    patterns[pattern].states.forEach((state, i) => {
                        let found = false;
                        channelStates.forEach(_id => {
                            if (this._applyPattern(objects, _id, state)) {
                                if (!result) {
                                    result = JSON.parse(JSON.stringify(patterns[pattern]));
                                    result.states.forEach((state, j) => {
                                        if (state.role) {
                                            delete state.role;
                                        }
                                        if (state.enums) {
                                            delete state.enums;
                                        }
                                        if (patterns[pattern].states[j].icon) {
                                            state.icon = patterns[pattern].states[j].icon;
                                        }
                                    });
                                }
                                result.states[i].id = _id;
                                found = true;
                            }
                        });
                        if (state.required && !found) {
                            result = null;
                            return false;
                        }
                    });

                    if (result && !result.states.find(state => state.required && !state.id)) {
                        // result.id = id;
                        this.cache[id] = result;
                        let deviceStates;

                        // looking for indicators
                        if (objects[id].type !== 'device') {
                            // get device name
                            const deviceId = ChannelDetector.getParentId(id);
                            deviceStates = ChannelDetector.getAllStatesInDevice(keys, deviceId);
                            if (deviceStates) {
                                deviceStates.forEach(_id => {
                                    result.states.forEach((state, i) => {
                                        if (!state.id && state.indicator) {
                                            if (this._applyPattern(objects, _id, patterns[pattern].states[i])) {
                                                result.states[i].id = _id;
                                            }
                                        }
                                    });
                                });
                            }
                        }
                        if (pattern === 'blinds') {
                            console.log('AAAA');
                        }

                        return result;
                    }
                }
            }
        }
        return null;
    }
}

export default ChannelDetector;