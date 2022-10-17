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
import SmartDialogGeneric from './SmartDialogGeneric';
import IconAdapter from '@iobroker/adapter-react-v5/Components/Icon';
import I18n from '@iobroker/adapter-react-v5/i18n';
import cls from './style.module.scss';
import StateIcon from '../States/components/StateIcon';
import CustomButton from '../States/components/CustomButton';
import CustomSlider from '../States/components/CustomSlider';

class SmartDialogCamera extends SmartDialogGeneric {
    constructor(props) {
        super(props);
        this.componentReady();
        this.state = {
            ptz: this.props.ptz
        }
        this.tMin = this.props.zoomMin || 0;
        this.tMax = this.props.zoomMax || 100;
        this.refImage = createRef();
    }

    onPtzChange = (value) => {
        this.typingTimer && clearTimeout(this.typingTimer);
        this.setState({ ptz: value });
        this.typingTimer = setTimeout(valueSet => {
            this.typingTimer = null;
            this.props.onPtzChange(valueSet);
        }, 100, value);
    }

    updateBinaryImage() {
        this.props.socket.getBinaryState(this.props.id)
            .then(base64 => {
                if (this.refImage.current) {
                    this.refImage.current.src = `data:image/jpeg;base64,${base64}`;
                }
                // Use dom to update image
            });
    }
    updateURLImage() {
        if (this.refImage.current) {
            this.refImage.current.src = this.props.url.includes('?') ? this.props.url + '&_q=' + Date.now() : this.props.url + '?_q' + Date.now();
        }
    }

    updateImage() {
        if (this.props.url) {
            this.updateURLImage();
        } else {
            this.updateBinaryImage();
        }
    }

    componentDidMount() {
        // get type of object 
        if (this.props.objects[this.props.id]?.common.type === 'file' && !this.props.state[this.props.id]) {
            // read every 5000
            this.updateInterval = setInterval(() => this.updateImage(), 1000);
            this.updateImage();
        }
    }

    componentWillUnmount() {
        this.updateInterval && clearInterval(this.updateInterval);
    }

    generateContent() {
        return <div className={cls.wrapperModalContentCamera}>
            {this.props.file || this.props.id &&
                <div className={cls.wrapCamera}>
                    {this.props.id && !this.props.file ?
                        <img ref={this.refImage} className={cls.camera} /> :
                        <IconAdapter className={cls.camera} src={this.props.file} />
                    }
                </div>
            }

            {this.props.autoFocus !== null && this.props.autoFocus !== undefined ?
                <CustomButton
                    startIcon={<StateIcon type={'AUTOFOCUS'} />}
                    active={this.props.autoFocus}
                    onClick={this.props.onAutoFocusToggle}
                    className={cls.cameraAutoFocus}>
                    {I18n.t('Autofocus')}
                </CustomButton> : null}

            {this.props.autoWhiteBalance !== null && this.props.autoWhiteBalance !== undefined ?
                <CustomButton
                    startIcon={<StateIcon type={'AUTOWHITEBALANCE'} />}
                    active={this.props.autoWhiteBalance}
                    onClick={this.props.onAutoWhiteBalanceToggle}
                    className={cls.cameraAutoWhiteBalance}>
                    {I18n.t('Auto white balance')}
                </CustomButton> : null}

            {this.props.brightness !== null && this.props.brightness !== undefined ?
                <CustomButton
                    startIcon={<StateIcon type={'BRIGHTNESS'} />}
                    active={this.props.brightness}
                    onClick={this.props.onBrightnessToggle}
                    className={cls.cameraBrightness}>
                    {I18n.t('Brightness')}
                </CustomButton> : null}

            {this.props.nightMode !== null && this.props.nightMode !== undefined ?
                <CustomButton
                    startIcon={<StateIcon type={'NIGHTMODE'} />}
                    active={this.props.nightMode}
                    onClick={this.props.onNightModeToggle}
                    className={cls.cameraNightMode}>
                    {I18n.t('Night')}
                </CustomButton> : null}
            {this.props.ptz !== null && this.props.ptz !== undefined &&
                <div className={cls.cameraPTZ}>
                    <div className={cls.textSliderPtz}><StateIcon type={'PTZ'} />{I18n.t('PTZ')}</div>
                    <CustomSlider
                        value={this.state.ptz}
                        onChange={value => {
                            this.onPtzChange(value);
                        }}
                        tMin={this.tMin}
                        tMax={this.tMax}
                        minMax
                    />
                </div>
            }
        </div>;
    }
}

SmartDialogCamera.propTypes = {
    name: PropTypes.string,
    dialogKey: PropTypes.string.isRequired,
    windowWidth: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    transparent: PropTypes.string,
    settings: PropTypes.bool,

    id: PropTypes.string,
};

export default SmartDialogCamera;
