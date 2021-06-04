/**
 * Copyright 2018-2020 bluefox <dogafox@gmail.com>
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
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
// import Theme from './theme';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
// import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
// load words for moment.js
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/ru';
import 'moment/locale/es';
import 'moment/locale/zh-cn';

import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';

/*const muiTheme = getMuiTheme({
    appBar: {
        //color: 'rgba(128, 128, 128, 0.8)',//''#337ab7',
        height: 48
    },
    refreshIndicator: {
        strokeColor: '#337ab7',
        loadingStrokeColor: '#337ab7'
    }
});*/


let themeName = Utils.getThemeName();

ReactDOM.render(
    <MuiThemeProvider theme={ theme(themeName) }>
        <App onThemeChange={_themeName => {
            themeName = _themeName;
            build();
        }}/>
    </MuiThemeProvider>,

    document.getElementById('root')
);

try {
    registerServiceWorker();
} catch (e) {
    window.noServiceWorker = true;
}
