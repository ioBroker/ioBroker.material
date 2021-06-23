/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

import I18n from '@iobroker/adapter-react/i18n';

import SmartDialogGeneric from './SmartDialogGeneric';
import cls from './style.module.scss';
import { ButtonGroup, FormControl, FormLabel } from '@material-ui/core';
import CustomButton from '../States/components/CustomButton';
import StateIcon from '../States/components/StateIcon';
import Icon from '../icons/RobotVacuum';

const styles = themes => ({
    dialogPaper: {
        maxHeight: 430,
    },
    root: {
        width: 'calc(100% - 1em)',
        maxWidth: 400,
        maxHeight: 400,
        margin: 'auto',
        height: '100%'
    }
});

class SmartDialogVacuumCleaner extends SmartDialogGeneric {
    static buttonBoostStyle = {
        position: 'absolute',
        left: 'calc(50% - 2em)',
        height: '1.3em',
        width: '4em',
        borderRadius: '1em',
        background: 'white',
        border: '1px solid #b5b5b5',
        paddingTop: '0.1em',
        fontSize: '2em',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
    };
    // expected:
    // startValue
    // actualValue
    // onValueChange
    // onClose
    // objects
    // states
    constructor(props) {
        super(props);
        this.stateRx.value = props.startValue || 0;
        this.stateRx.boostValue = props.boostValue;

        this.step = props.step || 0.5;
        this.min = props.min;
        if (this.min > props.actualValue) {
            this.min = props.actualValue;
        }
        if (this.min > props.startValue) {
            this.min = props.startValue;
        }
        this.max = props.max;
        if (this.max < props.actualValue) {
            this.max = props.actualValue;
        }
        if (this.max < props.startValue) {
            this.max = props.startValue;
        }

        this.refPanel = React.createRef();
        this.svgControl = null;
        this.componentReady();
    }

    onBoostMode = () => {
        this.props.onBoostToggle && this.props.onBoostToggle(!this.state.boostValue);
        this.setState({ boostValue: !this.state.boostValue });
    };

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <div className={cls.wrapperThermostat}>
                {this.state.boostValue !== null && this.state.boostValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Boost'} />}
                        active={this.state.boostValue}
                        onClick={this.onBoostMode}
                        className={cls.boostButton}>{I18n.t('Boost')}
                    </CustomButton> : null}
                {this.props.powerValue !== null && this.props.powerValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Power'} />}
                        active={this.props.powerValue}
                        onClick={this.props.onPowerToggle}
                        className={cls.powerButton}>
                        {I18n.t('Power')}
                    </CustomButton> : null}
                {this.props.partyValue !== null && this.props.partyValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Party'} />}
                        active={this.props.partyValue}
                        onClick={this.props.onPartyToggle}
                        className={cls.partyButton}>
                        {I18n.t('Party')}
                    </CustomButton> : null}
                {this.props.modeValue !== null && this.props.modeValue !== undefined ?
                    <FormControl className={cls.modeButton} component="fieldset">
                        <FormLabel component="legend">{I18n.t('Mode')}</FormLabel>
                        <ButtonGroup color="primary">
                            {this.props.modeArray && Object.keys(this.props.modeArray).map(name => <CustomButton
                                onClick={() => this.props.onMode(name)}
                                active={String(this.props.modeValue) === name}
                                key={name}>
                                {this.props.modeArray[name]}
                            </CustomButton>)}
                        </ButtonGroup>
                    </FormControl>
                    : null}
                {this.props.swingValue !== null && this.props.swingValue !== undefined ?
                    typeof this.props.swingValue === 'number' ?
                        <FormControl className={cls.swingGroup} component="fieldset">
                            <FormLabel component="legend">{I18n.t('Swing')}</FormLabel>
                            <ButtonGroup color="primary" orientation="vertical">
                                {this.props.swingArray && Object.keys(this.props.swingArray).map(name => <CustomButton
                                    onClick={() => this.props.onSwing(name)}
                                    active={String(this.props.swingValue) === name}
                                    key={name}>
                                    {this.props.swingArray[name]}
                                </CustomButton>)}
                            </ButtonGroup>
                        </FormControl> : <CustomButton
                            startIcon={<StateIcon type={'Swing'} />}
                            active={this.props.swingValue}
                            onClick={this.props.onSwing}
                            className={cls.swingButton}>
                            {I18n.t('Swing')}
                        </CustomButton>
                    : null}
                <div className={cls.charts}>
                    {this.props.humidityId && this.props.checkHistory(this.props.humidityId) && this.getCharts(this.props.humidityId, React.createRef())}
                    {this.props.actualId && this.props.checkHistory(this.props.actualId) && this.getCharts(this.props.actualId, React.createRef())}
                    {this.props.setId && this.props.checkHistory(this.props.setId) && this.getCharts(this.props.setId, React.createRef())}
                </div>
                <div ref={this.refPanel} className={cls.wrapperControl}>
                    {/* <ThermostatControl
                        afterComma={1}
                        unit={this.props.unit}
                        commaAsDelimiter={this.props.commaAsDelimiter === undefined ? true : this.props.commaAsDelimiter}
                        minValue={this.min}
                        maxValue={this.max}
                        hvacMode={'heating'}
                        ambientTemperature={this.props.actualValue}
                        targetTemperature={this.state.value}
                    /> */}
                    <div className={cls.wrapperVacuumCleaner}>
                        <Icon className={cls.vacuumCleaner} />
                    </div>
                </div>
            </div>
        </div>;
    }
}

SmartDialogVacuumCleaner.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string.isRequired,
    windowWidth: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    unit: PropTypes.string,
    step: PropTypes.number,
    commaAsDelimiter: PropTypes.bool,

    objects: PropTypes.object,
    states: PropTypes.object,
    onValueChange: PropTypes.func,
    startValue: PropTypes.number.isRequired,
    actualValue: PropTypes.number,
};

export default withStyles(styles)(SmartDialogVacuumCleaner);
