const Types = {
    unknown: 0,
    socket: 1,
    light: 2,
    blind: 4,
    valve: 5,
    rgb: 6,
    dimmer: 7,
    temperature: 8,
    humidity: 9,
    lock: 10,
    button: 11,
    door: 12,
    window: 13,
    windowTilt: 14,
    media: 15,
    thermostat: 16,
    camera: 17,
    motion: 18,
    fireAlarm: 19,
    floodAlarm: 20,
    gate: 21,
    info: 22
};

const patternWorking   = {role: /^indicator\.working$/,                 indicator: true,                                            name: 'WORKING',            required: false};
const patternUnreach   = {role: /^indicator(\.maintenance)?\.unreach$/, indicator: true,  type: 'boolean',                          name: 'UNREACH',            required: false};
const patternLowbat    = {role: /^indicator(\.maintenance)?\.lowbat$|^indicator(\.maintenance)?\.battery/,  indicator: true,  type: 'boolean',  name: 'LOWBAT', required: false};
const patternMaintain  = {role: /^indicator\.maintenance$/,             indicator: true,  type: 'boolean',                          name: 'MAINTAIN',           required: false};
const patternError     = {role: /^indicator\.error$/,                   indicator: true,                                            name: 'ERROR',              required: false};
const patternDirection = {role: /^indicator\.direction$/,               indicator: true,                                            name: 'DIRECTION',          required: false};

const patterns = {
    thermostat: {
        states: [
            {role: /temperature(\..*)?$/,          indicator: false,     write: true,  type: 'number',                                                    name: 'SET',                required: true},
            {role: /temperature(\..*)?$/,          indicator: false,     write: false, type: 'number',    searchInParent: true,                           name: 'ACTUAL',             required: false},
            {role: /humidity(\..*)?$/,             indicator: false,     write: false, type: 'number',    searchInParent: true,                           name: 'HUMIDITY',           required: false},
            {role: /^switch\.boost(\..*)?$/,       indicator: false,     write: true,  type: 'number',    searchInParent: true,                           name: 'BOOST',              required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.thermostat
    },
    blinds: {
        states: [
            {role: /^level(\.blind)?$/,                   indicator: false, type: 'number',  write: true, enums: roleOrEnumBlind, name: 'SET',                 required: true},
            {role: /^value(\.blind)?$/,                   indicator: false, type: 'number',               enums: roleOrEnumBlind, name: 'ACTUAL',              required: false},
            {role: /^button\.stop$|^action\.stop$/,       indicator: false, type: 'boolean', write: true, enums: roleOrEnumBlind, name: 'STOP',                required: false, noSubscribe: true},
            patternDirection,
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.blind
    },
    motion: {
        states: [
            {role: /^state\.motion$|^sensor\.motion$/,                   indicator: false, type: 'boolean', name: 'ACTUAL',     required: true},
            {role: /brightness$/,                                        indicator: false, type: 'number',  name: 'SECOND',     required: false},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.motion
    },
    window: {
        states: [
            {role: /^state(\.window)?$|^sensor(\.window)?/,                   indicator: false, type: 'boolean', enums: roleOrEnumWindow, name: 'ACTUAL',     required: true},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.window
    },
    windowTilt: {
        states: [
            {role: /^state?$|^value(\.window)?$/,                             indicator: false, type: 'number',  enums: roleOrEnumWindow, name: 'ACTUAL',     required: true},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.windowTilt
    },
    fireAlarm: {
        states: [
            {role: /^state?$|^sensor(\.alarm)?\.fire/,                        indicator: false, type: 'boolean', name: 'ACTUAL',     required: true, channelRole: /^sensor(\.alarm)?\.fire$/},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.fireAlarm
    },
    door: {
        states: [
            {role: /^state?$|^state(\.door)?$|^sensor(\.door)?/,              indicator: false, type: 'boolean', write: false, enums: roleOrEnumDoor, name: 'ACTUAL',     required: true},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.door
    },
    dimmer: {
        states: [
            {role: /^level(\.dimmer)?$/,                   indicator: false, type: 'number',  write: true,       enums: roleOrEnumLight, name: 'SET',         required: true},
            {role: /^value(\.dimmer)?$/,                   indicator: false, type: 'number',  write: false,      enums: roleOrEnumLight, name: 'ACTUAL',      required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.dimmer
    },
    light: {
        states: [
            {role: /^switch(\.light)?$|^state$/,           indicator: false, type: 'boolean', write: true,       enums: roleOrEnumLight, name: 'SET',         required: true},
            {role: /^switch(\.light)?$|^state$/,           indicator: false, type: 'boolean', write: false,      enums: roleOrEnumLight, name: 'ACTUAL',      required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.light
    },
    levelSlider: {
        states: [
            {role: /^level(\..*)?$/,                   indicator: false, type: 'number',  min: 'number', max: 'number', write: true,       name: 'SET',         required: true},
            {role: /^value(\..*)?$/,                   indicator: false, type: 'number',  min: 'number', max: 'number', write: false,      name: 'ACTUAL',      required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.value
    },
    socket: {
        states: [
            {role: /^switch$|^state$/,           indicator: false, type: 'boolean', write: true,       name: 'SET',         required: true},
            {role: /^switch$|^state$/,           indicator: false, type: 'boolean', write: false,      name: 'ACTUAL',      required: false},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.socket
    },
    button: {
        states: [
            {role: /^button(\.[.\w]+)?$|^action(\.[.\w]+)?$/,           indicator: false, type: 'boolean', read: false, write: true,       name: 'SET',         required: true, noSubscribe: true},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.button
    },
    temperature: {
        states: [
            {role: /temperature$/,             indicator: false, write: false, type: 'number',  name: 'ACTUAL',     required: true},
            {role: /humidity$/,                indicator: false, write: false, type: 'number',  name: 'SECOND',     required: false},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.temperature
    },
    info: {
        states: [
            {/*role: /^value(\.[.\w]+)|^sensor(\.[.\w]+)|^state(\.[.\w]+)$/,*/                                  indicator: false,                                 name: 'ACTUAL',         required: true, multiple: true, noDeviceDetection: true, ignoreRole: /\.inhibit$/},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.info
    }
};

function checkEnum(obj, enums, words) {
    let found = false;
    if (enums) {
        enums.forEach(en => {
            const pos = en.lastIndexOf('.');
            if (pos !== -1) {
                en = en.substring(pos + 1);
            }
            for (let lang in words) {
                if (words.hasOwnProperty(lang)) {
                    if (words[lang].find(reg => reg.test(en))) {
                        found = true;
                        return false;
                    }
                }
            }
        });
    }
    return found;
}
function roleOrEnum(obj, enums, roles, words) {
    if (roles && roles.indexOf(obj.common.role) !== -1) {
        return true;
    }
    return checkEnum(obj, enums, words);
}

// -------------- LIGHT -----------------------------------------
const lightWords = {
    en: [/lights?/i,    /lamps?/i,      /ceilings?/i],
    de: [/licht(er)?/i, /lampen?/i,     /beleuchtung(en)?/i],
    ru: [/свет/i,       /ламп[аы]/i,    /торшеры?/, /подсветк[аи]/i, /лампочк[аи]/i, /светильники?/i]
};
const lightRoles = ['switch.light', 'dimmer', 'value.dimmer', 'level.dimmer', 'sensor.light', 'state.light'];
function roleOrEnumLight(obj, enums) {
    return roleOrEnum(obj, enums, lightRoles, lightWords);
}

// -------------- BLINDS -----------------------------------------
const blindWords = {
    en: [/blinds?/i,    /windows?/i,    /shutters?/i],
    de: [/rollladen?/i, /fenstern?/i,   /beschattung(en)?/i],
    ru: [/ставни/i,     /рольставни/i,  /окна|окно/, /жалюзи/i]
};

const blindRoles = ['blind', 'level.blind', 'value.blind'];
function roleOrEnumBlind(obj, enums) {
    return roleOrEnum(obj, enums, blindRoles, blindWords);
}

// -------------- WINDOWS -----------------------------------------
const windowRoles = ['window', 'state.window', 'sensor.window', 'value.window'];
function roleOrEnumWindow(obj, enums) {
    return roleOrEnum(obj, enums, windowRoles, blindWords);
}

// -------------- DOORS -----------------------------------------
const doorsWords = {
    en: [/doors?/i,      /gates?/i,      /wickets?/i,        /entry|entries/i],
    de: [/türe?/i,       /tuere?/i,      /tore?/i,           /einfahrt(en)?/i,  /pforten?/i],
    ru: [/двери|дверь/i, /ворота/i,      /калитка|калитки/,  /въезды?/i,        /входы?/i]
};

const doorsRoles = ['door', 'state.door', 'sensor.door'];
function roleOrEnumDoor(obj, enums) {
    return roleOrEnum(obj, enums, doorsRoles, doorsWords);
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
            let role = null;
            if (!statePattern) {
                debugger;
            }
            if (statePattern.role) {
                role = statePattern.role.test(objects[id].common.role || '');

                if (role && statePattern.channelRole) {
                    const channelId = ChannelDetector.getParentId(id);
                    if (objects[channelId] && (objects[channelId].type === 'channel' || objects[channelId].type === 'device')) {
                        role = statePattern.channelRole.test(objects[channelId].common.role);
                    } else {
                        role = false;
                    }
                }
            }
            if (role === false) {
                return;
            }

            if (statePattern.ignoreRole && statePattern.ignoreRole.test(objects[id].common.role)) {
                return;
            }

            if (statePattern.indicator === false && (objects[id].common.role || '').match(/^indicator(\.[.\w]+)?$/)) {
                return;
            }

            if (statePattern.state && !statePattern.state.test(id.split('.').pop())) {
                return;
            }

            if (statePattern.write !== undefined && statePattern.write !== (objects[id].common.write || false)) {
                return;
            }
            if (statePattern.min === 'number' && typeof objects[id].common.min !== 'number') {
                return;
            }
            if (statePattern.max === 'number' && typeof objects[id].common.max !== 'number') {
                return;
            }

            if (statePattern.read !== undefined && statePattern.read !== (objects[id].common.read === undefined ? true : objects[id].common.read)) {
                return;
            }
            if (statePattern.type && statePattern.type !== objects[id].common.type) {
                return;
            }

            if (statePattern.enums && typeof statePattern.enums === 'function') {
                let enums = this.getEnumsForId(objects, id);
                if (!statePattern.enums(objects[id], enums)) {
                    return;
                }
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

    static copyState(oldState, newState) {
        if (!newState) {
            newState = JSON.parse(JSON.stringify(oldState));
        }
        newState.original = oldState.original || oldState;
        if (oldState.enums) {
            newState.enums = oldState.enums;
        }
        if (oldState.role) {
            newState.role = oldState.role;
        }
        if (oldState.channelRole) {
            newState.channelRole = oldState.channelRole;
        }
        if (oldState.icon) {
            newState.icon = oldState.icon;
        }
        return newState;
    }

    detect(objects, keys, id, usedIds) {
        if (this.cache[id]) {
            return this.cache[id];
        }

        usedIds = usedIds || [];

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

            if (id.indexOf('javascript.0.devices.sensorComplex') !== -1) {
                //console.log('aaa');
            }

            for (let pattern in patterns) {
                if (!patterns.hasOwnProperty(pattern)) continue;
                let result = null;

                if (pattern === 'temperature') {
                    //console.log(pattern);
                }

                let _usedIds = [];
                patterns[pattern].states.forEach((state, i) => {
                    let found = false;
                    channelStates.forEach(_id => {
                        if ((state.indicator || (usedIds.indexOf(_id) === -1 && _usedIds.indexOf(_id) === -1)) && this._applyPattern(objects, _id, state)) {
                            if (!state.indicator){
                                _usedIds.push(_id);
                            }
                            if (!result) {
                                result = JSON.parse(JSON.stringify(patterns[pattern]));
                                result.states.forEach((state, j) => ChannelDetector.copyState(patterns[pattern].states[j], state));
                            }
                            if (!result.states.find(e => e.id === _id)) {
                                result.states[i].id = _id;
                            }
                            found = true;
                            if (state.multiple && channelStates.length > 1) {
                                // execute this rule for every state in this channel
                                let index = i + 1;
                                channelStates.forEach(cid => {
                                    if (cid === _id) return;
                                    if ((state.indicator || (usedIds.indexOf(cid) === -1 && _usedIds.indexOf(cid) === -1)) && this._applyPattern(objects, cid, state)) {
                                        if (!state.indicator){
                                            _usedIds.push(cid);
                                        }
                                        const newState = ChannelDetector.copyState(state);
                                        newState.id = cid;
                                        result.states.splice(index++, 0, newState);
                                    }
                                });
                            }
                            return false; // stop iteration
                        }
                    });
                    if (state.required && !found) {
                        result = null;
                        return false;
                    }
                });

                if (result && !result.states.find(state => state.required && !state.id)) {
                    _usedIds.forEach(id => usedIds.push(id));
                    // result.id = id;
                    //this.cache[id] = result;
                    let deviceStates;

                    if (pattern === 'info') {
                        //console.log('AA');
                    }

                    // looking for indicators and special states
                    if (objects[id].type !== 'device') {
                        // get device name
                        const deviceId = ChannelDetector.getParentId(id);
                        if (objects[deviceId] && (objects[deviceId].type === 'channel' || objects[deviceId].type === 'device')) {
                            deviceStates = ChannelDetector.getAllStatesInDevice(keys, deviceId);
                            if (deviceStates) {
                                deviceStates.forEach(_id => {
                                    result.states.forEach((state, i) => {
                                        if (!state.id && (state.indicator || state.searchInParent) && !state.noDeviceDetection) {
                                            if (this._applyPattern(objects, _id, state.original)) {
                                                result.states[i].id = _id;
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    }
                    result.states.forEach(state => {
                        if (state.role) {
                            delete state.role;
                        }
                        if (state.enums) {
                            delete state.enums;
                        }
                        if (state.original) {
                            if (state.original.icon) {
                                state.icon = state.original.icon;
                            }
                            delete state.original;
                        }
                    });

                    return result;
                }
            }
        }
        return null;
    }
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = ChannelDetector;
} else {

}
export default ChannelDetector;