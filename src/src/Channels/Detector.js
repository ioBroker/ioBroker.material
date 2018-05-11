import IconThermostat   from 'react-icons/lib/ti/thermometer';
import IconLamp         from 'react-icons/lib/ti/lightbulb';
import IconWorking      from 'react-icons/lib/ti/cog-outline';

import Types from '../States/Types';

const patterns = {
    thermostat: {
        states: [
            {role: /^level.temperature(\..*)?$/,    name: 'SET_TEMPERATURE',    required: true,     icon: IconThermostat, color: '#E5AC00'},
            {role: /^value.temperature(\..*)?$/,    name: 'ACTUAL_TEMPERATURE', required: false,    icon: IconThermostat, color: '#E5AC00'},
            {role: /^switch.boost(\..*)?$/,         name: 'BOOST_MODE',         required: false,    icon: IconThermostat, color: '#E5AC00'}
        ],
        icon: IconThermostat,
        type: Types.thermostat
    },
    dimmer: {
        states: [
            {role: /^level(\.dimmer)?$/, type: 'number', write: true, enums: roleOrEnumLight, name: 'LAMP_SET', required: true, icon: IconLamp, color: '#fffc03'},
            {role: /^value(\.dimmer)?$/, type: 'number', enums: roleOrEnumLight, name: 'LAMP_ACT', required: false},
            {role: /^indicator.working$/, name: 'WORKING', required: false, icon: IconWorking, color: '#fffc03'}
        ],
        icon: IconLamp,
        type: Types.dimmer
    },
    light: {
        states: [
            {role: /^switch(\.light)?$|^state$/, type: 'boolean', write: true, enums: roleOrEnumLight, name: 'LAMP_SET', required: true, icon: IconLamp, color: '#fffc03'},
            {role: /^switch(\.light)?$|^state$/, type: 'boolean', write: true, enums: roleOrEnumLight, name: 'LAMP_ACT', required: true, icon: IconLamp, color: '#fffc03'}
        ],
        icon: IconLamp,
        type: Types.light
    }
};

const lightWords = {
    en: [/lights?/i,    /lamps?/i,      /ceilings?/i],
    de: [/licht(er)?/i, /lampen?/i,     /beleuchtung(en)?/],
    ru: [/свет/i,       /ламп[аы]/i,    /торшеры?/, /подсветк[аи]/i, /лампочк[аи]/i, /светильники?/i,]
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

    static getChannelFromState(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        } else {
            return id;
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
            const channel = ChannelDetector.getChannelFromState(id);
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
                    let allRequiredFound = true;
                    let result = null;
                    if (id === 'hm-rpc.0.FEQ0082127.1') {
                        console.log('AAA');
                    }

                    patterns[pattern].states.forEach((state, i) => {
                        let found = false;
                        channelStates.forEach(_id => {
                            if (objects[_id] && objects[_id].common) {
                                if (state.role && !state.role.test(objects[_id].common.role)) {
                                    return;
                                }
                                if (state.write !== undefined && state.write !== (objects[_id].common.write || false)) {
                                    return;
                                }
                                if (state.read !== undefined && state.read !== (objects[_id].common.read === undefined ? true : objects[_id].common.read)) {
                                    return;
                                }
                                if (state.type && state.type !== objects[_id].common.type) {
                                    return;
                                }
                                let enums = this.getEnumsForId(objects, _id);

                                if (state.enums && typeof state.enums === 'function' && (!enums || !enums.length || !state.enums(objects[_id], enums))) {
                                    return;
                                }
                                if (!result) {
                                    result = JSON.parse(JSON.stringify(patterns[pattern]));
                                    result.states.forEach(state => {
                                        if (state.role) {
                                            delete state.role;
                                        }
                                        if (state.enums) {
                                            delete state.enums;
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
                        result.id = id;
                        this.cache[id] = result;
                        return result;
                    }
                }
            }
        }
        return null;
    }
}

export default ChannelDetector;