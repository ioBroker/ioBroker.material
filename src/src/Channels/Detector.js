import Theme            from '../theme';

import IconWorking      from 'react-icons/lib/ti/cog-outline';
import IconUnreach      from 'react-icons/lib/md/perm-scan-wifi';
import IconMaintain     from 'react-icons/lib/md/priority-high';
import IconLowbat       from 'react-icons/lib/md/battery-alert';
import IconError        from 'react-icons/lib/md/error';

import Types from '../States/Types';

const patternWorking  = {role: /^indicator\.working$/,                 indicator: true,                                            name: 'WORKING',            required: false, icon: IconWorking,    color: Theme.tile.tileIndicatorsIcons.working};
const patternUnreach  = {role: /^indicator(\.maintenance)?\.unreach$/, indicator: true,  type: 'boolean',                          name: 'UNREACH',            required: false, icon: IconUnreach,    color: Theme.tile.tileIndicatorsIcons.unreach};
const patternLowbat   = {role: /^indicator(\.maintenance)?\.lowbat$|^indicator(\.maintenance)?\.battery/,  indicator: true,  type: 'boolean',  name: 'LOWBAT', required: false, icon: IconLowbat,     color: Theme.tile.tileIndicatorsIcons.lowbat};
const patternMaintain = {role: /^indicator\.maintenance$/,             indicator: true,  type: 'boolean',                          name: 'MAINTAIN',           required: false, icon: IconMaintain,   color: Theme.tile.tileIndicatorsIcons.maintain};
const patternError    = {role: /^indicator\.error$/,                   indicator: true,                                            name: 'ERROR',              required: false, icon: IconError,      color: Theme.tile.tileIndicatorsIcons.error};

const patterns = {
    thermostat: {
        states: [
            {role: /^level\.temperature(\..*)?$/,          indicator: false,                                                       name: 'SET',                required: true},
            {role: /^value\.temperature(\..*)?$/,          indicator: false,                                                       name: 'ACTUAL',             required: false},
            {role: /^switch\.boost(\..*)?$/,               indicator: false,                                                       name: 'BOOST',              required: false},
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
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.blind
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
    windowTile: {
        states: [
            {role: /^value(\.window)?$/,                                      indicator: false, type: 'number',  enums: roleOrEnumWindow, name: 'ACTUAL',     required: true},
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.windowTile
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
            {role: /^state(\.door)?$|^sensor(\.door)?/,                       indicator: false, type: 'boolean', write: false, enums: roleOrEnumDoor, name: 'ACTUAL',     required: true},
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
            {role: /^value(\.dimmer)?$/,                   indicator: false, type: 'number',                     enums: roleOrEnumLight, name: 'ACTUAL',      required: false},
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
            {role: /^switch(\.light)?$|^state$/,           indicator: false, type: 'boolean', write: true,       enums: roleOrEnumLight, name: 'ACTUAL',      required: true},
            patternWorking,
            patternUnreach,
            patternLowbat,
            patternMaintain,
            patternError
        ],
        type: Types.light
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
            if (statePattern.role) {
                role = statePattern.role.test(objects[id].common.role);

                if (role && statePattern.channelRole) {
                    const channelId = ChannelDetector.getParentId(id);
                    if (objects[channelId] && (objects[channelId].type === 'channel' || objects[channelId].type === 'device')) {
                        role = statePattern.channelRole.test(objects[channelId].common.role);
                    } else {
                        role = false;
                    }
                    if (role) {
                        console.log('A');
                    }
                }
            }
            if (role === false) {
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

            if (id.indexOf('FEQ0082127') !== -1) {
                console.log('a');
            }

            for (let pattern in patterns) {
                if (patterns.hasOwnProperty(pattern)) {
                    let result = null;

                    patterns[pattern].states.forEach((state, i) => {
                        let found = false;
                        channelStates.forEach(_id => {
                            if (this._applyPattern(objects, _id, state)) {
                                if (!result) {
                                    result = JSON.parse(JSON.stringify(patterns[pattern]));
                                    result.states.forEach((state, j) => {
                                        if (patterns[pattern].states[j].enums) {
                                            state.enums = patterns[pattern].states[j].enums;
                                        }
                                        if (patterns[pattern].states[j].role) {
                                            state.role = patterns[pattern].states[j].role;
                                        }
                                        if (patterns[pattern].states[j].channelRole) {
                                            state.channelRole = patterns[pattern].states[j].channelRole;
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

                        return result;
                    }
                }
            }
        }
        return null;
    }
}

export default ChannelDetector;