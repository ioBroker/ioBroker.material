import React from 'react';
import PropTypes from 'prop-types';
import Generic from './Generic';
//import FontIcon from 'material-ui/FontIcon';
import IconSmokingRooms from 'react-icons/md/smoking-rooms';
import IconSettings from 'react-icons/md/settings';
import IconBatteryAlert from 'react-icons/md/battery-alert';
import IconFileDownload from 'react-icons/md/file-download';
import IconFileUpload from 'react-icons/md/file-upload';
import IconSettingsRemote from 'react-icons/md/settings-remote';
import IconError from 'react-icons/md/error';
import IconWarning from 'react-icons/md/warning';
import IconPermScanWifi from 'react-icons/md/perm-scan-wifi';
import IconBuild from 'react-icons/md/build';
import IconHelp from 'react-icons/md/help';

const styles = {
    bar: {
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0.8
    },
    colors: {
        alarm: '#d60e4e'
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
    {id: IndicatorTypes.fire,        icon: (<IconSmokingRooms size={fontSize} color={styles.colors.alarm} />), label: 'Fire',        invert: false, bool: true},
    {id: IndicatorTypes.water,       icon: (<IconSettings size={fontSize} color={styles.colors.alarm} />), label: 'Water',       invert: false, bool: true},
    {id: IndicatorTypes.working,     icon: (<IconSettings size={fontSize} color='gray' />), label: 'Working',     invert: false, bool: true},
    {id: IndicatorTypes.battery,     icon: (<IconBatteryAlert size={fontSize} color={styles.colors.alarm} />), label: 'Battery low', invert: false, bool: true},
    {id: IndicatorTypes.direction,   icon: {
            down: (<IconFileDownload size={fontSize} color='blue' className='flip-down'/>),
            up:   (<IconFileUpload   size={fontSize} color='blue' className='flip-up'/>)
        },
        label: 'Direction',   invert: false, bool: false},
    {id: IndicatorTypes.motion,      icon: (<IconSettingsRemote color={styles.colors.alarm} size={fontSize} />), label: 'Motion',      invert: false, bool: true},
    {id: IndicatorTypes.error,       icon: (<IconError color='orange' size={fontSize}/>), label: 'Error',       invert: false, bool: true},
    {id: IndicatorTypes.unreach,     icon: (<IconPermScanWifi color: 'orange' size={fontSize}/>), label: 'Unreachable', invert: false, bool: true},
    {id: IndicatorTypes.alarm,       icon: (<IconWarning color={styles.colors.alarm} size={fontSize} />), label: 'Alarm',       invert: false, bool: true},
    {id: IndicatorTypes.connected,   icon: (<IconPermScanWifi color='orange' size={fontSize} />), label: 'Connected',   invert: true, bool: true},
    {id: IndicatorTypes.updates,     icon: (<IconBuild color='green' size={fontSize} />), label: 'Updates',     invert: false, bool: true},
    {id: IndicatorTypes.maintenance, icon: (<IconBuild color='green' size={fontSize} />), label: 'Maintenance', invert: false, bool: true},
    {id: IndicatorTypes.unknown,     icon: (<IconHelp color='green' size={fontSize} />), label: 'Unknown',     invert: false, bool: true},
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

