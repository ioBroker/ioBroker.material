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

import React from 'react';
import { createRoot } from 'react-dom/client';
import pack from '../package.json';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { Button } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

import * as serviceWorker from './serviceWorker';

import '@iobroker/adapter-react-v5/index.css';
import theme from '@iobroker/adapter-react-v5/Theme';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import App from './App';

window.adapterName = 'material';
window.sentryDSN = 'https://e5306c44730b45aea200a2f5a2635ae9@sentry.iobroker.net/135';

console.log('iobroker.' + window.adapterName + '@' + pack.version);
let themeName = Utils.getThemeName();

function build() {
    const notistackRef = React.createRef();
    const onClickDismiss = key => () =>
        notistackRef.current.closeSnackbar(key);

    const container = document.getElementById('root');
    const root = createRoot(container);
    return root.render(
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme(themeName)}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <SnackbarProvider
                        ref={notistackRef}
                        action={key => <Button onClick={onClickDismiss(key)}>x</Button>}
                        maxSnack={6}
                    >
                        <App onThemeChange={_themeName => {
                            themeName = _themeName;
                            build();
                        }} />
                    </SnackbarProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </StyledEngineProvider>);
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
