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
import SmartDialogGeneric from './SmartDialogGeneric';
import cls from './style.module.scss';

class SmartDialogEchartCustom extends SmartDialogGeneric {
    // expected:
    // center
    // data
    // getReadHistoryData
    // radius
    // iconSetting
    // states
    constructor(props) {
        super(props);
        this.componentReady();
    }

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <iframe className={cls.iframeModal} src={`http://localhost:8082/echarts/index.html?preset=${'echarts.0.MyChar'}t&noBG=true`} />
        </div>;
    }
}

SmartDialogEchartCustom.propTypes = {
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    dialogKey: PropTypes.string.isRequired,
    windowWidth: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    transparent: PropTypes.string,
    enumNames: PropTypes.number,
    settings: PropTypes.bool,
    iconSetting: PropTypes.bool,
    center: PropTypes.string,
    data: PropTypes.object,
    radius: PropTypes.number,
    getReadHistoryData: PropTypes.func,

    objects: PropTypes.object,
    ids: PropTypes.object,
    onValueChange: PropTypes.func,
    actualValue: PropTypes.number,
};

export default SmartDialogEchartCustom;
