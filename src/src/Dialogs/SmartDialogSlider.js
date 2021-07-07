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
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { darken } from '@material-ui/core/styles/colorManipulator';
import Fab from '@material-ui/core/Fab';

import { FaAngleDoubleUp as IconUp } from 'react-icons/fa';
import { FaAngleDoubleDown as IconDown } from 'react-icons/fa';
import { TiLightbulb as IconLamp } from 'react-icons/ti';
import { MdStop as IconStop } from 'react-icons/md'

import I18n from '@iobroker/adapter-react/i18n';

import Theme from '../theme';
import SmartDialogGeneric from './SmartDialogGeneric';
import { withStyles } from "@material-ui/core/styles";
import cls from './style.module.scss';
import CustomButton from '../States/components/CustomButton';
import CustomFab from '../States/components/CustomFab';

const styles = theme => ({
    dialogPaper: {
        maxHeight: 800,
    },
    buttonStyle: {
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
    },
    buttonStopStyle: {
        position: 'absolute',
        left: 'calc(50% + 10em)',
        bottom: '4.5em',
        height: '2em',
        width: '2.5em'
    },
    sliderStyle: {
        position: 'absolute',
        zIndex: 11,
        width: 200,
        border: '1px solid #b5b5b5',
        borderRadius: '2em',
        overflow: 'hidden',
        background: 'white',
        cursor: 'pointer',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
        height: 'calc(100% - 12em - 48px)',
        top: 'calc(4em + 48px)',
        left: 'calc(50% - 100px)'
    }
});

let mouseDown = false;
class SmartDialogSlider extends SmartDialogGeneric {
    // expected:
    static types = {
        value: 0,
        dimmer: 1,
        blinds: 2
    };

    constructor(props) {
        super(props);
        this.stateRx.value = this.externalValue2localValue(this.props.startValue || 0);
        this.stateRx.toggleValue = this.props.startToggleValue || false;
        this.lastControl = 0;

        this.refSlider = React.createRef();

        this.type = this.props.type || SmartDialogSlider.types.dimmer;
        this.step = this.props.step || 20;
        this.button = {
            time: 0,
            name: '',
            timer: null,
            timeUp: 0
        };
        this.closeOnPaperClick = true; // used in generic
        this.componentReady();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.startValue !== this.state.value && !mouseDown && Date.now() - this.lastControl > 1000) {
            this.setState({ value: nextProps.startValue });
        }
        if (nextProps.startToggleValue !== undefined && nextProps.startToggleValue !== this.state.toggleValue) {
            this.setState({ toggleValue: nextProps.startToggleValue });
        }
    }

    eventToValue(e) {
        const pageY = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY;

        let value = 100 - Math.round((pageY - this.top) / this.height * 100) + 9;

        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        this.setState({ value });
        if (Date.now() - this.lastControl > 200 && this.type !== SmartDialogSlider.types.blinds) {
            this.lastControl = Date.now();
            this.props.onValueChange && this.props.onValueChange(this.localValue2externalValue(value));
        }
    }

    onMouseMove = e => {
        if (mouseDown) {
            e.preventDefault();
            e.stopPropagation();
            this.eventToValue(e);
        }
    }

    onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();

        mouseDown = true;

        if (!this.height) {
            if (this.refSlider.current) {
                this.height = this.refSlider.current.offsetHeight;
                this.top = this.refSlider.current.offsetTop;
            } else {
                return;
            }
        }

        this.eventToValue(e);

        document.getElementById('dimmerId').addEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.addEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId').addEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    localValue2externalValue(value) {
        if (this.props.min !== undefined && this.props.max !== undefined) {
            return value * (this.props.max - this.props.min) / 100 + this.props.min;
        } else {
            return value;
        }
    }

    externalValue2localValue(value) {
        if (this.props.min !== undefined && this.props.max !== undefined) {
            return ((value - this.props.min) / (this.props.max - this.props.min)) * 100;
        } else {
            return value;
        }
    }

    onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.click = Date.now();
        mouseDown = false;
        console.log('Stopped');
        document.getElementById('dimmerId')?.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });

        this.lastControl = Date.now();
        this.props?.onValueChange && this.props.onValueChange(this.localValue2externalValue(this.state.value));
    }

    componentWillUnmount(){
        document.getElementById('root').className = ``;
        document.getElementById('dimmerId')?.removeEventListener('mousemove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.removeEventListener('mouseup', this.onMouseUp, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchmove', this.onMouseMove, { passive: false, capture: true });
        document.getElementById('dimmerId')?.removeEventListener('touchend', this.onMouseUp, { passive: false, capture: true });
    }

    getTopButtonName() {
        switch (this.props.type) {
            case SmartDialogSlider.types.blinds:
                return <IconUp style={{ color: 'white', width: 20, height: 20 }} />;

            case SmartDialogSlider.types.dimmer:
                return <IconLamp style={{ color: Theme.palette.lampOn, width: 20, height: 20 }} />;

            default:
                if (this.props.max !== undefined) {
                    return this.props.max + (this.props.unit || '');
                } else {
                    return I18n.t('ON');
                }
        }
    }

    getBottomButtonName() {
        switch (this.props.type) {
            case SmartDialogSlider.types.blinds:
                return <IconDown style={{ color: 'white', width: 20, height: 20 }} />;

            case SmartDialogSlider.types.dimmer:
                return <IconLamp style={{ color: 'white', width: 20, height: 20 }} />;

            default:

                if (this.props.min !== undefined) {
                    return this.props.min + (this.props.unit || '');
                } else {
                    return I18n.t('OFF');
                }
        }
    }

    onButtonDown(e, buttonName) {
        e && e.stopPropagation();
        if (Date.now() - this.button.time < 50) return;
        if (this.button.timer) {
            clearTimeout(this.button.timer);
        }
        this.button.name = buttonName;
        this.button.time = Date.now();
        this.button.timer = setTimeout(() => {
            this.button.timer = null;
            let value;
            switch (this.button.name) {
                case 'top':
                    value = 100;
                    break;

                case 'bottom':
                    value = 0;
                    break;
                default:
                    break;
            }
            this.setState({ value });
            this.props.onValueChange && this.props.onValueChange(this.localValue2externalValue(value));
        }, 400);
    }

    onButtonUp = e => {
        e && e.stopPropagation();
        if (Date.now() - this.button.timeUp < 100) {
            if (this.button.timer) {
                clearTimeout(this.button.timer);
                this.button.timer = null;
            }
        } else {
            console.log('on Button UP: ' + (Date.now() - this.button.timeUp));
            this.button.timeUp = Date.now();

            if (this.button.timer) {
                clearTimeout(this.button.timer);
                this.button.timer = null;
                let value = this.state.value;
                switch (this.button.name) {
                    case 'top':
                        if (value % this.step === 0) {
                            value += this.step;
                        } else {
                            value += this.step - (value % this.step);
                        }
                        break;

                    case 'bottom':
                        if (value % this.step === 0) {
                            value -= this.step;
                        } else {
                            value -= value % this.step;
                        }
                        break;
                    default:
                        break;
                }
                if (value > 100) {
                    value = 100;
                } else if (value < 0) {
                    value = 0;
                }
                this.setState({ value });
                this.props.onValueChange && this.props.onValueChange(this.localValue2externalValue(value));
            }
            this.click = Date.now();
        }
    }

    getSliderColor() {
        if (this.props.type === SmartDialogSlider.types.blinds) {
            return undefined;
        } else if (this.props.type === SmartDialogSlider.types.dimmer) {
            const val = this.state.value;
            return darken(Theme.palette.lampOn, 1 - (val / 70 + 0.3));
        } else {
            return Theme.slider.background;
        }
    }

    getValueText() {
        let unit = '%';
        if (this.props.type !== SmartDialogSlider.types.blinds && this.props.type !== SmartDialogSlider.types.dimmer) {
            unit = (this.props.unit || '');
        }
        if (this.props.min !== undefined && this.props.max !== undefined) {
            return (this.state.value * (this.props.max - this.props.min) / 100 + this.props.min).toFixed() + unit;
        } else {
            return this.state.value + unit;
        }
    }

    getToggleButton() {
        if (!this.props.onToggle) {
            return null;
        }
        return <CustomFab
            key={this.props.dialogKey + '-toggle-button'}
            active={this.props.startToggleValue}
            onClick={this.props.onToggle}
            className={clsx('dimmer-button', cls.buttonToggleStyle)}
        >
            <IconLamp />
        </CustomFab>;
    }

    getStopButton() {
        if (!this.props.onStop) {
            return null;
        }

        return <CustomFab
            key={this.props.dialogKey + '-stop-button'}
            color="secondary"
            onClick={this.props.onStop}
            className={clsx('dimmer-button', cls.buttonStopStyle)}>
            <IconStop />
        </CustomFab>;
    }

    generateContent() {
        let sliderStyle = {
            position: 'absolute',
            width: '100%',
            left: 0,
            height: (this.props.type === SmartDialogSlider.types.blinds ? 100 - this.state.value : this.state.value) + '%',
            background: this.props.background || this.getSliderColor()
        };
        if (true || !mouseDown) {
            sliderStyle.transitionProperty = 'height';
            sliderStyle.transitionDuration = '0.3s';
        }

        let handlerStyle = {
            position: 'absolute',
            width: '2em',
            height: '0.3em',
            left: 'calc(50% - 1em)',
            background: 'white',
            borderRadius: '0.4em'
        };

        if (this.props.type === SmartDialogSlider.types.blinds) {
            sliderStyle.top = 0;
            handlerStyle.bottom = '0.4em';
            sliderStyle.backgroundImage = 'linear-gradient(0deg, #949494 4.55%, #c9c9c9 4.55%, #c9c9c9 50%, #949494 50%, #949494 54.55%, #c9c9c9 54.55%, #c9c9c9 100%)';
            sliderStyle.backgroundSize = '44px 44px';
            sliderStyle.backgroundPosition = 'center bottom';
        } else {
            sliderStyle.bottom = 0;
            handlerStyle.top = '0.4em';
        }

        return <div className={cls.wrapperSlider}>
            <div className={cls.wrapperSliderBlock}>
                <CustomButton onClick={e => this.onButtonDown(e, 'top')}>
                    {this.getTopButtonName()}
                </CustomButton>
                <div
                    key={this.props.dialogKey + '-slider'}
                    id="dimmerId"
                    ref={this.refSlider}
                    onMouseDown={this.onMouseDown}
                    onTouchStart={this.onMouseDown}
                    onClick={e => e.stopPropagation()}
                    className={cls.sliderStyle}
                >
                    <div style={sliderStyle}>
                        <div style={handlerStyle} />
                    </div>
                    <div className={cls.sliderText}>
                        {this.getValueText()}
                    </div>
                </div>
                <CustomButton onClick={e => this.onButtonDown(e, 'bottom')}>
                    {this.getBottomButtonName()}
                </CustomButton>
            </div>
            {this.getStopButton()}
            {this.getToggleButton()}
        </div>;
    }
}

SmartDialogSlider.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string,
    windowWidth: PropTypes.number,

    onClose: PropTypes.func,

    onStop: PropTypes.func,
    onToggle: PropTypes.func,

    onValueChange: PropTypes.func,
    startValue: PropTypes.number,
    startToggleValue: PropTypes.bool,
    type: PropTypes.number
};

export default withStyles(styles)(SmartDialogSlider);
