import IconThermostat  from 'react-icons/lib/ti/thermometer';

const patterns = {
    thermostat: [
        {role: /^level.temperature(\..*)?$/,    name: 'SET_TEMPERATURE',    required: true,     icon: IconThermostat, color: '#E5AC00'},
        {role: /^value.temperature(\..*)?$/,    name: 'ACTUAL_TEMPERATURE', required: false,    icon: IconThermostat, color: '#E5AC00'},
        {role: /^switch.boost(\..*)?$/,         name: 'ACTUAL_TEMPERATURE', required: false,    icon: IconThermostat, color: '#E5AC00'}
    ]
};

class ChannelDetector {
    static detect(objects, keys, id) {

    }
}

export default ChannelDetector;