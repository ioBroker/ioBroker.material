import React from 'react';
import Generic from './Generic';
import Utils from '../Utils';
import IconSun from 'react-icons/lib/fa/sun-o';
import IconTint from 'react-icons/lib/fa/tint';
import IconMale from 'react-icons/lib/fa/male';
import IconFemale from 'react-icons/lib/fa/female';
import IconThermometer from 'react-icons/lib/ti/thermometer';
import 'moment';
import 'moment/locale/ru';
import 'moment/locale/de';
import 'moment/locale/fr';
import 'moment/locale/fr';
import 'moment/locale/pt';
import Moment from 'react-moment';
import Theme from '../theme';

const styles = {
    icons: {
        float: 'right'
    },
    units: {
        float: 'right',
        minWidth: '2em',
        paddingLeft: '0.3em'
    }
};

const InfoTypes = {
    'brightness':   (<IconSun color='green' style={styles.icons} width={Theme.indicatorSize} height={Theme.indicatorSize}/>),
    'humidity':     (<IconTint color='blue' style={styles.icons} width={Theme.indicatorSize} height={Theme.indicatorSize}/>),
    'motion-true':  (<span>
                     <IconMale className='blinker-0' color='green' style={styles.icons} width={Theme.indicatorSize} height={Theme.indicatorSize}/>
                     <IconFemale className='blinker-1' color='green' style={styles.icons} width={Theme.indicatorSize} height={Theme.indicatorSize}/>
                     </span>),
    'motion-false': (<IconMale color='green' style={Object.assign({opacity: 0.6},    styles.icons)} width={Theme.indicatorSize} height={Theme.indicatorSize}/>),
    'temperature':  (<IconThermometer color='orange' style={styles.icons} width={Theme.indicatorSize} height={Theme.indicatorSize}/>)
};

class Info extends Generic {
    // constructor(props) {
    //     super(props);
    // }
    updateState(id, state) {
        this.setState({
            state: state.val,
            lc: state.lc
        });
    }

    getValue() {
        if (typeof this.state.state === 'boolean') {
            return this.state.state ? 'true' : 'false';
        } else {
            let item = this.props.objects[this.props.id];
            if (item && item.common && item.states) {
                if (item.states[this.state.state] !== undefined) {
                    Utils.CapitalWords(item.states[this.state.state]);
                } else {
                    return this.state.state;
                }
            } else {
                return this.state.state;
            }
        }
    }

    getUnit() {
        if (!this.props.id) {
            return (<span style={styles.units}>{'\u00a0'}</span>);
        }
        let obj = this.props.objects[this.props.id];
        if (obj && obj.common) {
            if (obj.common.role && obj.common.role.indexOf('motion') !== -1 && this.state.lc) {
                return (<span style={{paddingLeft: '0.3em', whiteSpace: 'nowrap'}}><Moment fromNow date={new Date(this.state.lc)} locale="de"/></span>);
            } else {
                return (<span style={styles.units}>{obj.common.unit || '\u00a0'}</span>);
            }
        } else {
            return (<span style={styles.units}>{'\u00a0'}</span>);
        }
    }

    static renderInfo(value, unit, icon, role, objects, id, label, channelName, enumName) {
        if (label && !id) {
            return (<span style={Generic.styles.header}>
                {Generic.getObjectName(objects, id, label, channelName, enumName) || ''}
                {value}{unit}{icon}
            </span>);
        } else
        if (label && id) {
            return (<div style={Generic.styles.header}>{Generic.getObjectName(objects, id, label, channelName, enumName) || ''}
                <div style={Generic.styles.subHeader}>{Generic.getObjectName(objects, id, '', label, enumName) || ''}</div>
                {value}{unit}{icon}
            </div>);
        } else {
            return (<span>{Generic.getObjectName(objects, id, label, channelName, enumName)}{value}{unit}{icon}</span>);
        }
    }

    render() {
        const item = this.props.objects[this.props.id];
        let role = '';
        if (item && item.common && item.common.role) {
            role = item.common.role.replace(/^value\.|^level\.|^indicator./, '');
        }
        let value = this.getValue();
        if (InfoTypes[role + '-' + value]) {
            value = InfoTypes[role + '-' + value];
        }

        return this.wrapContent((
            <div style={{height: '1.5em', paddingTop: '0.5em'}}>
                <span style={{display: 'none'}}>{this.props.id}</span>
                {Info.renderInfo(
                    (<span style={{float: 'right', fontWeight: 'bold'}}>{value}</span>),
                    this.getUnit(),
                    InfoTypes[role] || null,
                    role,
                    this.props.objects,
                    this.props.id,
                    this.props.label,
                    this.props.channelName,
                    this.props.enumName
                )}
            </div>
        ));
    }
}

export default Info;

