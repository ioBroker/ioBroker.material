import React from 'react';
import Generic from './Generic';
import PropTypes from 'prop-types';
import StateTypes from './Types';
import ActionLightbulbOutline from 'material-ui/svg-icons/action/lightbulb-outline'
import Toggle from 'material-ui/Toggle';
import iobTheme from '../theme';

const styles = {
    bulbOn: {
        background: iobTheme.appBar.background//'linear-gradient(135deg, #fff9c0 12%,#f1da36 100%)'
    },
    toggle: {
        paddingTop: '0.4em',
        display: 'inline-block',
        width: 'calc(100% - 2.3em)'
    },
};

class Switch extends Generic {
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
                    <div key={this.props.id + '.icon'} style={this.state.state ? styles.bulbOn : {}} className="iob-icon">
                        <ActionLightbulbOutline />
                    </div>
                );

            default:
                return null;
        }
    }

    render() {
        return this.wrapContent([
                (<Toggle
                    key={this.props.id}
                    label={this.getObjectName()}
                    labelStyle={{overflow: 'hidden', fontWeight: this.props.label ? 'bold' : ''}}
                    onToggle={(obj, toggled) => this.handleChange(toggled)}
                    defaultToggled={this.state.state === 'on' || this.state.state === 'ON' || this.state.state === 1 || this.state.state === '1' || this.state.state === true || this.state.state === 'true'}
                    style={styles.toggle}
            />),
            this.getIcon()]
        );
    }
}

export default Switch;

