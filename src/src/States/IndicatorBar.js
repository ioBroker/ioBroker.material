import React from 'react';
import PropTypes from 'prop-types';
import Generic from './Generic';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    bar: {
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0.8
    }
};

const IndicatorTypes = {
    invalid: 0,
    fire: 1,
    water: 2,
    working: 3,
    battery: 4,
    direction: 5,
    motion: 6,
    error: 7,
    unreach: 8,
    alarm: 9,
    connected: 10,
    updates: 11,
    maintenance: 12,
    unknown: 13
};
const fontSize = '1.25em';

const IndicatorProps = [
    {id: IndicatorTypes.invalid,     icon: null, label: 'invalid',     invert: false, bool: true},
    {id: IndicatorTypes.fire,        icon: (<FontIcon style={{color: 'red', fontSize: fontSize}} className='material-icons'>smoking_rooms</FontIcon>), label: 'Fire',        invert: false, bool: true},
    {id: IndicatorTypes.water,       icon: (<FontIcon style={{color: 'red', fontSize: fontSize}} className='material-icons'>settings</FontIcon>), label: 'Water',       invert: false, bool: true},
    {id: IndicatorTypes.working,     icon: (<FontIcon style={{color: 'gray', fontSize: fontSize}} className='material-icons rotate'>settings</FontIcon>), label: 'Working',     invert: false, bool: true},
    {id: IndicatorTypes.battery,     icon: (<FontIcon style={{color: 'red', fontSize: fontSize}} className='material-icons'>battery_alert</FontIcon>), label: 'Battery low', invert: false, bool: true},
    {id: IndicatorTypes.direction,   icon: {
            down: (<FontIcon style={{color: 'blue', fontSize: fontSize}} className='material-icons flip-down'>file_download</FontIcon>),
            up:   (<FontIcon style={{color: 'blue', fontSize: fontSize}} className='material-icons flip-up'>file_upload</FontIcon>)
        },
        label: 'Direction',   invert: false, bool: false},
    {id: IndicatorTypes.motion,      icon: (<FontIcon style={{color: 'red', fontSize: fontSize}} className='material-icons'>settings_remote</FontIcon>), label: 'Motion',      invert: false, bool: true},
    {id: IndicatorTypes.error,       icon: (<FontIcon style={{color: 'orange', fontSize: fontSize}} className='material-icons'>error</FontIcon>), label: 'Error',       invert: false, bool: true},
    {id: IndicatorTypes.unreach,     icon: (<FontIcon style={{color: 'orange', fontSize: fontSize}} className='material-icons'>perm_scan_wifi</FontIcon>), label: 'Unreachable', invert: false, bool: true},
    {id: IndicatorTypes.alarm,       icon: (<FontIcon style={{color: 'orange', fontSize: fontSize}} className='material-icons'>warning</FontIcon>), label: 'Alarm',       invert: false, bool: true},
    {id: IndicatorTypes.connected,   icon: (<FontIcon style={{color: 'orange', fontSize: fontSize}} className='material-icons'>perm_scan_wifi</FontIcon>), label: 'Connected',   invert: true, bool: true},
    {id: IndicatorTypes.updates,     icon: (<FontIcon style={{color: 'green', fontSize: fontSize}} className='material-icons'>build</FontIcon>), label: 'Updates',     invert: false, bool: true},
    {id: IndicatorTypes.maintenance, icon: (<FontIcon style={{color: 'green', fontSize: fontSize}} className='material-icons'>build</FontIcon>), label: 'Maintenance', invert: false, bool: true},
    {id: IndicatorTypes.unknown,     icon: (<FontIcon style={{color: 'green', fontSize: fontSize}} className='material-icons'>help</FontIcon>), label: 'Unknown',     invert: false, bool: true},
];

class IndicatorBar extends Generic {
    static propTypes = {
        ids:     PropTypes.array.isRequired,
        objects: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props, true);
        let states = {};
        this.props.ids.forEach(id => states[id] = false);

        this.state = states;
        if (this.props.ids) {
            this.onCollectIds(this.props.ids, true);
        }
    }

    getObjectName(id) {
        return Generic.getObjectNameSpan(this.props.objects, id);
    }

    // default handler
    updateState(id, state) {
        let _state = {};
        _state[id] = state.val;
        this.setState(_state);
    }

    getIndicatorType(id) {
        let item = this.props.objects[id];
        if (item && item.common) {
            let role = item.common.role;
            let key = Object.keys(IndicatorTypes).find(name => role.indexOf(name) !== -1);
            if (key !== null) {
                return IndicatorTypes[key];
            } else {
                return IndicatorTypes.unknown;
            }
        } else {
            return IndicatorTypes.invalid;
        }
    }

    renderIcon(id, state) {
        let type = this.getIndicatorType(id);
        if (type !== IndicatorTypes.invalid && IndicatorProps[type]) {
            let props = IndicatorProps[type];

            if (props.bool) {
                if ((!props.invert && state) || (props.invert && !state)) {
                    return props.icon;
                }
            } else {
                if (state &&
                    this.props.objects[id] &&
                    this.props.objects[id].common &&
                    this.props.objects[id].common.states &&
                    this.props.objects[id].common.states[state])
                {
                    let val = this.props.objects[id].common.states[state].toLowerCase(); //UP, DOWN
                    return props.icon[val] || null;
                }
            }
        } else {
            return null;
        }
    }

    render() {
        return (<div style={styles.bar}>
            {this.props.ids.map(id => this.renderIcon(id, this.state[id]))}
        </div>);
    }
}

export default IndicatorBar;

