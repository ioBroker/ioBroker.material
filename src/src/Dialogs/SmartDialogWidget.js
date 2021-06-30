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
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import clsx from 'clsx';

import I18n from '@iobroker/adapter-react/i18n';
import { MdFilterCenterFocus } from "react-icons/md";

import SmartDialogGeneric from './SmartDialogGeneric';
import cls from './style.module.scss';
import cls2 from '../SmartTile/style.module.scss';
import { Paper } from '@material-ui/core';


class SmartDialogWidget extends SmartDialogGeneric {
    constructor(props) {
        super(props);
        console.log(11223344, props)
        this.componentReady();
    }

    generateContent() {
        return <div className={cls.wrapperModalContent}>
            <div className={cls.wrapperWidgets}>
            <div className={cls.widgetName}>{this.props.name}</div>
                {this.props.arrayWidgets.map(el =>
                    <div
                        className={cls.widgetWrapperItem}
                        key={el.name}>
                        <div className={cls.widgetNames}>{el.name}</div>
                        <Paper
                            style={{
                                width: 272,
                                height: 128
                            }}
                            onClick={()=>{
                                el.onClick();
                                this.props.onClose();
                            }}
                            //    className={this.hasAnimation}
                            className={clsx(cls2.paperSmartTitle,cls.wrapperBlockWidgets)}
                        >
                            <div className={cls2.wrapperContent}>
                                <div className={cls.displayFlex}>
                                    {el.component}
                                </div>
                            </div>
                        </Paper>
                    </div>)}
            </div>
        </div>;
    }
}

SmartDialogWidget.propTypes = {
    name: PropTypes.string,
};

export default SmartDialogWidget;
