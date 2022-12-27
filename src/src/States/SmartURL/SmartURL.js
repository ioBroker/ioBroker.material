/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
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
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';

import { FaVideo as IconCam } from 'react-icons/fa';
import SmartGeneric from '../SmartGeneric';
import Dialog from '../../Dialogs/SmartDialogURL';
import { Utils } from '@iobroker/adapter-react-v5';
import IconAdapter from '@iobroker/adapter-react-v5/Components/Icon';
import clsGeneric from '../style.module.scss';

const styles = {
    'title-div': {
        position: 'absolute',
        zIndex: 1,
        fontWeight: 'bold',
        bottom: 0,
        left: 0,
        height: 48,
        background: 'rgba(255,255,255,0.45)',
        color: 'rgba(0, 0, 0, 0.6)',
        width: '100%',
        textAlign: 'left',
    },
    'title-text': {
        paddingLeft: 16,
        paddingTop: 16,
    },
    iframe: {
        position: 'absolute',
        zIndex: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: 0,
    },
    image: {
        zIndex: 0,
        border: 0,
        width: 'auto',
        height: '100%',
        margin: 'auto',
    },
};

class SmartURL extends SmartGeneric {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.ids = {
            url: null,
        };

        this.collectState = null;
        this.collectTimer = null;

        if (this.channelInfo.states) {
            // Actual
            let state = this.channelInfo.states.find(state => state && state.id && state.name === 'URL');
            if (state) {
                this.id = state.id;
                this.ids.url = state.id;
                const settingsId = state.settingsId;
                if (settingsId) {
                    const settings = Utils.getSettingsCustomURLs(this.props.objects[settingsId], null, { user: this.props.user });
                    if (settings) {
                        const tile = settings.find(e => e.id === state.id);
                        if (tile) {
                            this.stateRx.settings = JSON.parse(JSON.stringify(tile));
                            this.customSettings = this.stateRx.settings;
                        }
                    }
                }
            } else {
                this.id = '';
            }
        }

        if (this.id) {
            const m = this.id.match(/^_custom_(\d+)$/);
            if (m && Date.now() - m[1] < 500) {
                this.stateRx.showSettings = true;
            }
        }
        this.stateRx.url = this.stateRx.settings ? this.stateRx.settings.url || this.stateRx.settings.background || '' : '';
        this._isImage = this.isImage(this.stateRx.settings);

        this.width = 2;
        this.props.tile.setState({ isPointer: false, state: true });
        this.props.tile.setVisibility(this.id && !!this.stateRx.settings);
        this.key = `smart-warning-${this.id}-`;
        this.stateRx.showDialog = false; // support dialog in this tile used in generic class

        this.interval = null;

        this.componentReady();
    }

    isImage(settings) {
        settings = settings || this.customSettings;
        if (!settings) {
            return false;
        }
        return settings.isImage || !!(settings.background || settings.url || '').toLowerCase().match(/\.png|\.jpg|\.gif|\.jpeg/);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updateUrl() {
        if (!this.customSettings.background && !this.customSettings.url) {
            return;
        }

        if (this._isImage) {
            const url = this.customSettings.url || this.customSettings.background;
            if (url.includes('?')) {
                this.setState({ url: `${url}&ts=${Date.now()}` });
            } else {
                this.setState({ url: `${url}?ts=${Date.now()}` });
            }
        }
    }

    componentDidMount () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.customSettings && this.customSettings.update) {
            this.interval = setInterval(() => this.updateUrl(), this.customSettings.update);
        }
    }

    onUpdateTimer() {
        this.collectTimer = null;
        if (this.collectState) {
            if (this.collectState[this.id] !== undefined) {
                this.props.tile.setVisibility(!!this.collectState[this.id]);
            }
            this.setState(this.collectState);
            this.collectState = null;
        }
    }

    updateState(id, state) {
        if (id === this.ids.url) {
            this.collectState = this.collectState || {};
            this.collectState[id] = state.val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else {
            console.log(`${id} => ${state.val}`);
            super.updateState(id, state);
        }
    }

    getDialogSettings() {
        const settings = super.getDialogSettings();

        settings.unshift({
            name: 'hideIcon',
            value: this.state.settings.hideIcon || false,
            type: 'boolean',
        });

        settings.unshift({
            name: 'fullWidth',
            value: this.state.settings.fullWidth || false,
            type: 'boolean',
        });

        settings.unshift({
            name: 'updateInDialog',
            value: this.state.settings.updateInDialog || 0,
            type: 'number',
        });

        settings.unshift({
            name: 'update',
            value: this.state.settings.update || 0,
            type: 'number',
        });

        settings.unshift({
            name: 'title',
            value: (this.state.settings.title === undefined) ? '' : this.state.settings.title,
            type: 'text',
        });

        settings.unshift({
            name: 'url',
            value: (this.state.settings.url === undefined) ? '' : this.state.settings.url,
            type: 'text'
        });

        settings.unshift({
            name: 'isImage',
            value: this.state.settings?.isImage || false,
            type: 'boolean'
        });

        settings.forEach((e, i) => {
            if (e && e.name === 'background') {
                e.type = 'text';
                settings.splice(i, 1);
                settings.unshift(e);
                return false;
            }
        });

        // remove name from list
        settings.forEach((e, i) => {
            if (e && e.name === 'name') {
                settings.splice(i, 1);
                return false;
            }
        });

        settings.unshift({
            type: 'delete',
        });
        return settings;
    }

    saveDialogSettings(settings) {
        if (settings) {
            settings.update = parseInt(settings.update, 10) || 0;
            if (settings.update && settings.update < 500) {
                settings.update = 500;
            }
            settings.updateInDialog = parseInt(settings.updateInDialog, 10) || 0;
            if (settings.updateInDialog && settings.updateInDialog < 500) {
                settings.updateInDialog = 500;
            }
        }

        super.saveDialogSettings(settings, newSettings => {
            this.customSettings = newSettings;

            this.componentDidMount();
            this._isImage = this.isImage();
            this.setState({ settings: newSettings });
        });
    }

    getIconDiv() {
        let customIcon;
        if (this.state.settings.hideIcon) {
            return null;
        }

        if (this.state.settings.icon) {
            customIcon = <IconAdapter src={this.state.settings.icon} alt="icon" style={{ height: '100%', zIndex: 1, color: 'white' }} />;
        } else {
            customIcon = <IconCam className={clsGeneric.iconStyle} />;
        }
        return SmartGeneric.renderIcon(customIcon);
    }

    getIFrameDiv() {
        if (!this._isImage && this.state.settings.url) {
            return <iframe
                key="iframe"
                title={this.state.settings ? this.state.settings.name || '' : ''}
                className={this.props.classes.iframe}
                src={this.state.settings.url}
            />;
        }
        if (this._isImage && this.state.url) {
            return <img
                key="img"
                className={this.props.classes.image}
                src={this.state.url}
                alt="camera"
            />;
        }
        return null;
    }

    getTitleDiv() {
        const classes = this.props.classes;
        let title = this.state.settings.title;

        if (title) {
            return <div key="title" className={classes['title-div']}>
                <div className={classes['title-text']}>{title}</div>
            </div>;
        }

        return null;
    }

    onDialogClose = () => {
        // super.onDialogClose();
        this.setState({ showDialog: false });
        // start timer again
        this.componentDidMount();
    }

    onLongClick(e) {
        super.onLongClick(e);
        // Stop update timer
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    render() {
        return this.wrapContent([
            this.getIFrameDiv(),
            this.getIconDiv(),
            this.getTitleDiv(),
            this.state.showDialog ?
                <Dialog
                    dialogKey={`${this.key}dialog`}
                    open={!0}
                    key={`${this.key}dialog`}
                    name={this.state.settings ? this.state.settings.name || '' : ''}
                    enumNames={this.props.enumNames}
                    settings={this.state.settings}
                    objects={this.props.objects}
                    isImage={this._isImage}
                    onCollectIds={this.props.onCollectIds}
                    ids={this.ids}
                    windowWidth={this.props.windowWidth}
                    onClose={this.onDialogClose}
                /> : null
        ]);
    }
}

export default withStyles(styles)(SmartURL);
