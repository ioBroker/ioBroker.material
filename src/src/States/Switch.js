import React from 'react';
import Generic from './Generic';
import PropTypes from 'prop-types';
import StateTypes from './Types';
import ActionLightbulbOutline from 'react-icons/lib/md/lightbulb-outline'
import Switch from '@material-ui/core/Switch';
import Theme from '../theme';

const styles = {
    bulbOn: {
        background: Theme.appBar.background//'linear-gradient(135deg, #fff9c0 12%,#f1da36 100%)'
    },
    toggle: {
        paddingTop: '0.4em',
        display: 'inline-block',
        width: 'calc(100% - 2.3em)'
    },
};

class SwitchCustom extends Generic {
    static propTypes = {
        type: PropTypes.number.isRequired
    };

    updateState(id, state) {
        this.setState({
            state: state.val
        });
    }

    handleChange(isInputChecked) {
        // default handler
        this.props.onControl(this.props.id, isInputChecked);
    }

    getIcon() {
        switch (this.props.type) {
            case StateTypes.light:
                return (
                    <div key={this.props.id + '.1icon'} style={this.state.state ? styles.bulbOn : {}} className="iob-icon">
                        <ActionLightbulbOutline  width={Theme.indicatorSize} height={Theme.indicatorSize}/>
                    </div>
                );

            default:
                return null;
        }
    }

    render() {
        return this.wrapContent([
                (<Switch
                    key={this.props.id + '1'}
                    label={this.getObjectName()}
                    onToggle={(obj, toggled) => this.handleChange(toggled)}
                    checked={this.state.state === 'on' || this.state.state === 'ON' || this.state.state === 1 || this.state.state === '1' || this.state.state === true || this.state.state === 'true'}
                    style={styles.toggle}
            />),
            this.getIcon()]
        );
    }
}

export default SwitchCustom;

