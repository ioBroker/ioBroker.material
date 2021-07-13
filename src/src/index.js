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
import ReactDOM from 'react-dom';
import { version } from '../package.json';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as Sentry from '@sentry/browser';
import * as SentryIntegrations from '@sentry/integrations';

import { Button } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';

import * as serviceWorker from './serviceWorker';

import '@iobroker/adapter-react/index.css';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import App from './App';

window.adapterName = 'material';

console.log('iobroker.' + window.adapterName + '@' + version);
let themeName = Utils.getThemeName();

function build() {
    const notistackRef = React.createRef();
    const onClickDismiss = key => () =>
        notistackRef.current.closeSnackbar(key);

    return ReactDOM.render(<MuiThemeProvider theme={theme(themeName)}>
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
    </MuiThemeProvider>, document.getElementById('root'));
}

if (window.location.host !== 'localhost:3000') {
    Sentry.init({
        dsn: 'https://e5306c44730b45aea200a2f5a2635ae9@sentry.iobroker.net/135',
        integrations: [
            new SentryIntegrations.Dedupe()
        ]
    });
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();