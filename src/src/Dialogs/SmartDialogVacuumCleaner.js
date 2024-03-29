/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
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
import { withStyles } from '@mui/styles';

import { Tooltip } from '@mui/material';

import { Utils, I18n, Icon as IconAdapter } from '@iobroker/adapter-react-v5';

import { IoMdBatteryCharging } from 'react-icons/io';

import SmartDialogGeneric from './SmartDialogGeneric';
import cls from './style.module.scss';
import CustomButton from '../States/components/CustomButton';
import StateIcon from '../States/components/StateIcon';
import Icon from '../icons/RobotVacuum';
import Circle2 from '../icons/Circle2';
import CustomMode from '../States/components/CustomMode';

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

        this.refPanel = createRef();
        this.refVacuum = createRef();
        this.refVacuumAnimation = createRef();
        this.svgControl = null;
        this.componentReady();

        this.workModeArray = this.props.workModeArray;
        this.modeArray = this.props.modeArray;

        // If too many items => remove all items with numbers
        if (this.workModeArray && Object.keys(this.workModeArray).length > 6) {
            this.workModeArray = {};
            Object.keys(this.props.workModeArray).filter(id => isNaN(parseFloat(this.props.workModeArray[id])))
                .forEach(id => this.workModeArray[id] = this.props.workModeArray[id]);
            if (!Object.keys(this.workModeArray).length) {
                this.workModeArray = this.props.workModeArray;
            }
        }
        if (this.modeArray && Object.keys(this.modeArray).length > 6) {
            this.modeArray = {};
            Object.keys(this.props.modeArray).filter(id => isNaN(parseFloat(this.props.modeArray[id])))
                .forEach(id => this.modeArray[id] = this.props.modeArray[id]);
            if (!Object.keys(this.modeArray).length) {
                this.modeArray = this.props.modeArray;
            }
        }
    }

    componentDidMount() {
        // document.getElementById('root').className = `blurDialogOpen`;
        if (this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }
        if (this.props.batteryVacuum !== null && this.props.batteryVacuum !== undefined) {
            this.renderGenerateContent();
        }
    }

    renderGenerateContent = () => {
        if (this.refVacuum.current && !this.checkRef) {
            this.checkRef = true;
            this.subscribeWAddEvent();
            this.resizeThrottler();
        } else if (!this.refVacuum.current && !this.checkRef) {
            setTimeout(() => {
                this.renderGenerateContent();
            }, 100);
        }
    }

    subscribeWAddEvent = () => {
        window.addEventListener("resize", this.resizeThrottler);
    }

    resizeThrottler = () => {
        if (this.refVacuum.current && this.refVacuumAnimation.current) {
            const { clientHeight, clientWidth } = this.refVacuum.current;
            const widthOrHeight = clientHeight >= clientWidth ? clientWidth : clientHeight;
            this.refVacuumAnimation.current.style.width = `${widthOrHeight}px`;
            this.refVacuumAnimation.current.style.height = `${widthOrHeight}px`;
        }
    }

    componentWillUnmount() {
        // document.getElementById('root').className = ``;
        if (this.props.onCollectIds && this.subscribed) {
            this.props.onCollectIds(this, this.subscribes, false);
            this.subscribed = null;
        }
        window.removeEventListener("resize", this.resizeThrottler);
    }

    onBoostMode = () => {
        this.props.onBoostToggle && this.props.onBoostToggle(!this.state.boostValue);
        this.setState({ boostValue: !this.state.boostValue });
    };

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <div className={cls.wrapperVacuum}>
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
                    <CustomMode
                        label={I18n.t('Mode')}
                        objs={this.modeArray}
                        value={this.props.modeValue}
                        onChange={this.props.onMode}
                        className={cls.modeButton}
                    />
                    : null}
                {this.props.stateVacuum !== null && this.props.stateVacuum !== undefined ?
                    <div className={cls.stateVacuum}>
                        <div className={cls.titleVacuum}>{I18n.t('State')}</div>
                        <span>{this.props.stateVacuum}</span>
                    </div>
                    : null}
                {this.props.workModeValue !== null && this.props.workModeValue !== undefined ?
                    <CustomMode
                        label={I18n.t('Work mode')}
                        objs={this.workModeArray}
                        value={this.props.workModeValue}
                        onChange={this.props.onWorkMode}
                        className={cls.swingGroup}
                        orientation="vertical"
                    /> : null}
                <div className={cls.wrapperState}>
                    {this.props.batteryVacuum !== null && this.props.batteryVacuum !== undefined &&
                        <Tooltip title={I18n.t('Battery level')}>
                            <div className={cls.batteryVacuumTop}>
                                <IoMdBatteryCharging />{this.props.batteryVacuum}{this.props.batteryUnit}
                            </div>
                        </Tooltip>
                    }
                    {this.props.wasteVacuum !== null && this.props.wasteVacuum !== undefined &&
                        <Tooltip title={I18n.t('Water level')}>
                            <div className={cls.waterVacuumTop}>
                                <StateIcon type="WATER" />{this.props.wasteVacuum}{this.props.wasteUnit}
                            </div>
                        </Tooltip>
                    }
                    {this.props.waterVacuum !== null && this.props.waterVacuum !== undefined &&
                        <Tooltip title={I18n.t('Waste level')}>
                            <div className={cls.wasteVacuumTop}>
                                <StateIcon type="WASTE" />{this.props.waterVacuum}{this.props.waterUnit}
                            </div>
                        </Tooltip>
                    }
                </div>
                {
                    ((this.props.filterVacuum !== null && this.props.filterVacuum !== undefined) ||
                        (this.props.sideBrushVacuum !== null && this.props.sideBrushVacuum !== undefined) ||
                        (this.props.brushVacuum !== null && this.props.brushVacuum !== undefined) ||
                        (this.props.sensorVacuum !== null && this.props.sensorVacuum !== undefined)) &&
                    <div className={Utils.clsx(cls.infoBlockVacuum, this.props.stateVacuum === null || this.props.stateVacuum === undefined ? cls.infoBlockVacuumMiddle : '')}>
                        {this.props.filterVacuum !== null && this.props.filterVacuum !== undefined &&
                            <Tooltip title={I18n.t('Filter')}>
                                <div className={cls.currentItemInfo}>
                                    <StateIcon type="FILTER" />{this.props.filterVacuum}{this.props.filterUnit}
                                </div>
                            </Tooltip>
                        }
                        {this.props.sideBrushVacuum !== null && this.props.sideBrushVacuum !== undefined &&
                            <Tooltip title={I18n.t('Side brush')}>
                                <div className={cls.currentItemInfo}>
                                    <StateIcon type="SIDE_BRUSH" />{this.props.sideBrushVacuum}{this.props.sideBrushUnit}
                                </div>
                            </Tooltip>
                        }
                        {this.props.brushVacuum !== null && this.props.brushVacuum !== undefined &&
                            <Tooltip title={I18n.t('Main brush')}>
                                <div className={cls.currentItemInfo}>
                                    <StateIcon type="BRUSH" />{this.props.brushVacuum}{this.props.brushUnit}
                                </div>
                            </Tooltip>
                        }
                        {this.props.sensorVacuum !== null && this.props.sensorVacuum !== undefined &&
                            <Tooltip title={I18n.t('Sensors')}>
                                <div className={cls.currentItemInfo}>
                                    <StateIcon type="SENSORS" />{this.props.sensorVacuum}{this.props.sensorUnit}
                                </div>
                            </Tooltip>
                        }
                    </div>
                }
                <div className={cls.wrapperControl}>
                    <div className={Utils.clsx(cls.wrapperVacuumCleaner, !(this.props.imageVacuum !== null && this.props.imageVacuum !== undefined && this.props.powerValue) && cls.displayNone)}>
                        <IconAdapter className={cls.styleImageState} src={this.props.imageVacuum} />
                    </div>
                    <div className={Utils.clsx(cls.wrapperVacuumCleaner, (this.props.imageVacuum !== null && this.props.imageVacuum !== undefined && this.props.powerValue) && cls.displayNone)}>
                        <Icon d={"M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"} className={Utils.clsx(cls.vacuumCleaner, this.props.powerValue && !this.props.pauseValue && cls.vacuumCleanerWork, this.props.powerValue && this.props.pauseValue && cls.vacuumCleanerPause)} />
                        {this.props.batteryVacuum !== null && this.props.batteryVacuum !== undefined &&
                            <div ref={this.refVacuum} className={Utils.clsx(cls.batteryAnimation, this.props.powerValue && !this.props.pauseValue && cls.vacuumCleanerWork, this.props.powerValue && this.props.pauseValue && cls.vacuumCleanerPause)}>
                                <div className={cls.refVacuumAnimation} ref={this.refVacuumAnimation} style={{ width: '100%', height: '100%' }}>
                                    <Circle2 style={{ top: `${this.props.batteryVacuum ? 100 - this.props.batteryVacuum : 0}%` }} className={cls.circle1} />
                                    <Circle2 style={{ top: `calc(5px + ${this.props.batteryVacuum ? 100 - this.props.batteryVacuum : 0}%)` }} className={cls.circle2} />
                                </div>
                                <div className={cls.batteryVacuum}>
                                    <IoMdBatteryCharging />{this.props.batteryVacuum}{this.props.batteryUnit}
                                </div>
                            </div>}
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
