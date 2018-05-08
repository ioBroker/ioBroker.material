import React from 'react';
import Generic from './Generic';
import PropTypes from 'prop-types';
import StateTypes from './Types';
import ActionLightbulbOutline from 'react-icons/md/lightbulb-outline'
import Slider from 'material-ui/Slider';
import iobTheme from '../theme';

const styles = {
    bulbOn: {
        background: iobTheme.appBar.background//'linear-gradient(135deg, #fff9c0 12%,#f1da36 100%)'

    }
};

class Dimmer extends Generic {
    static propTypes = {
        type: PropTypes.number.isRequired
    };
    constructor(props) {
        super(props);
        this.timer = null;
    }

    updateState(id, state) {
        this.setState({
            state: state.val
        });
    }

    handleChange(value) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.timer = null;
            this.props.onControl(this.props.id, value)
        }, 300);
    }

    getIcon() {
        switch (this.props.type) {
            case StateTypes.light:
                return (
                    <div key={this.props.id + '.icon'} style={this.state.state ? styles.bulbOn : {}} className="iob-icon">
                        <ActionLightbulbOutline />
                    </div>
                );
            case StateTypes.blind:
                let item = this.props.objects[this.props.id];
                let min = 0;
                let max = 100;
                if (item && item.common) {
                    if (item.common.min !== undefined) {
                        min = parseFloat(item.common.min);
                    }
                    if (item.common.max !== undefined) {
                        max = parseFloat(item.common.max);
                    }
                }
                let value = ((parseFloat(this.state.state) || 0) - min) / (max - min);
                value = Math.round(value / 10) * 10;

                return (
                    <div key={this.props.id + '.icon'} className="iob-icon">
                        <ActionLightbulbOutline />
                    </div>
                );

            default:
                return null;
        }
    }

    getValue(isIcon) {
        if (typeof this.state.state === 'boolean') {
            return (<span key={this.props.id + '.value'} style={{float: 'right', minWidth: '3em', textAlign: 'right', marginTop: isIcon ? 8 : 0}}>{this.state.state ? 'true' : 'false'}</span>);
        } else {
            return (<span key={this.props.id + '.value'} style={{float: 'right', minWidth: '3em', textAlign: 'right', marginTop: isIcon ? 8 : 0}}>{this.state.state}{this.getUnit()}</span>);
        }
    }

    getUnit() {
        if (!this.props.id) {
            return '';
        }
        let obj = this.props.objects[this.props.id];
        if (obj && obj.common ) {
            return ' ' + (obj.common.unit || '');
        } else {
            return '';
        }
    }

    render() {
        let item = this.props.objects[this.props.id];
        if (!item.common) {
            item = null;
        }
        const min  = item && item.common.min  !== undefined? parseFloat(item.common.min)  : 0;
        const max  = item && item.common.max  !== undefined? parseFloat(item.common.max)  : 100;
        const step = item && item.common.step !== undefined? parseFloat(item.common.step) : ((max - min) / 100);
        let icon = this.getIcon();

        return this.wrapContent([
            (<div key={this.props.id + '.div'}>{this.getObjectName()}</div>),
            (<Slider
                key={this.props.id}
                style={{width: icon ? 'calc(100% - 6em)' : 'calc(100% - 4em)', display: 'inline-block', marginTop: icon ? 8: 0}}
                sliderStyle={{margin: 0}}
                min={min}
                max={max}
                step={step}
                value={parseFloat(this.state.state || 0)}
                onChange={(event, value) => this.handleChange(value)} />),
            this.getValue(icon),
            icon]
        );
    }
}

export default Dimmer;

