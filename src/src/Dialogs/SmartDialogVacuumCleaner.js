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
import Circle1 from '../icons/Circle1';
import Circle2 from '../icons/Circle2';
import { IoMdBatteryCharging } from "react-icons/io";
import IconAdapter from '@iobroker/adapter-react/Components/Icon';

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
                {this.props.pauseValue !== null && this.props.pauseValue !== undefined ?
                    <CustomButton
                        startIcon={<StateIcon type={'Pause'} />}
                        active={this.props.pauseValue}
                        onClick={this.props.onPauseToggle}
                        className={cls.boostButton}>{I18n.t('Pause')}
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
                {this.props.stateVacuum !== null && this.props.stateVacuum !== undefined ?
                    <div className={cls.stateVacuum}>
                        <div className={cls.titleVacuum}>{I18n.t('State')}</div>
                        <span>{this.props.stateVacuum}</span>
                    </div>
                    : null}

                {this.props.workModeValue !== null && this.props.workModeValue !== undefined ?
                    <FormControl className={cls.swingGroup} component="fieldset">
                        <FormLabel component="legend">{I18n.t('Work mode')}</FormLabel>
                        <ButtonGroup color="primary" orientation="vertical">
                            {this.props.workModeArray && Object.keys(this.props.workModeArray).map(name => <CustomButton
                                onClick={() => this.props.onWorkMode(name)}
                                active={String(this.props.workModeValue) === name}
                                key={name}>
                                {this.props.workModeArray[name]}
                            </CustomButton>)}
                        </ButtonGroup>
                    </FormControl> : null}
                <div className={cls.wrapperState}>
                    {this.props.batteryVacuum !== null && this.props.batteryVacuum !== undefined && <div className={cls.batteryVacuumTop}>
                        <IoMdBatteryCharging />{this.props.batteryVacuum}{this.props.batteryUnit}
                    </div>}
                    {this.props.wasteVacuum !== null && this.props.wasteVacuum !== undefined && <div className={cls.waterVacuumTop}>
                        <StateIcon type="WATER" />{this.props.wasteVacuum}{this.props.wasteUnit}
                    </div>}
                    {this.props.watherVacuum !== null && this.props.watherVacuum !== undefined && <div className={cls.wasteVacuumTop}>
                        <StateIcon type="WASTE" />{this.props.watherVacuum}{this.props.watherUnit}
                    </div>}
                </div>
                <div className={cls.wrapperControl}>
                    {this.props.imageVacuum !== null && this.props.imageVacuum !== undefined && this.props.powerValue && !this.props.pauseValue ?
                        <IconAdapter className={cls.styleImageState} src={this.props.imageVacuum} />
                        : <div className={cls.wrapperVacuumCleaner}>
                            <Icon d={"M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"} className={clsx(cls.vacuumCleaner, this.props.powerValue && !this.props.pauseValue && cls.vacuumCleanerWork, this.props.powerValue && this.props.pauseValue && cls.vacuumCleanerPause)} />
                            {this.props.batteryVacuum !== null && this.props.batteryVacuum !== undefined && <div className={clsx(cls.batteryAnimation, this.props.powerValue && !this.props.pauseValue && cls.vacuumCleanerWork, this.props.powerValue && this.props.pauseValue && cls.vacuumCleanerPause)}>
                                <Circle1 style={{ top: `${this.props.batteryVacuum ? 100 - this.props.batteryVacuum : 0}%` }} className={cls.circle1} />
                                <Circle2 style={{ top: `calc(5px + ${this.props.batteryVacuum ? 100 - this.props.batteryVacuum : 0}%)` }} className={cls.circle2} />
                                <div className={cls.batteryVacuum}>
                                    <IoMdBatteryCharging />{this.props.batteryVacuum}{this.props.batteryUnit}
                                </div>
                            </div>}
                        </div>}
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
