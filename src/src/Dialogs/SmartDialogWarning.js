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
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { MdClose as IconClose } from 'react-icons/md';

import { I18n } from '@iobroker/adapter-react-v5';

import SmartDialogGeneric from './SmartDialogGeneric';

const HEIGHT_HEADER  = 64;
const HEIGHT_ICON    = 300;
const HEIGHT_TITLE   = 48;
const HEIGHT_DATE    = 48;
const HEIGHT_INFO    = 48;
const HEIGHT_DESC    = 120;

const styles = {
    'header-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'date-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'date-start': {
    },
    'date-end': {
    },
    'title-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 16
    },
    'title-text': {
    },
    'info-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'info-text': {
    },
    'icon-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16,
        cursor: 'pointer',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        height: HEIGHT_ICON
    },
    'desc-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'desc-text': {
    },
    'chart-dialog': {
        zIndex: 2101
    },
    'chart-dialog-paper': {
        width: 'calc(100% - 2em)',
        maxWidth: 'calc(100% - 2em)',
        height: 'calc(100% - 2em)',
        maxHeight: 'calc(100% - 2em)'
    },
    'chart-dialog-img': {
        width: '100%',
    },
    'chart-dialog-content': {
        width: 'calc(100% - 4em)',
        height: 'calc(100% - 4em)',
        cursor: 'pointer',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
    },

};

class SmartDialogWarning extends SmartDialogGeneric  {
    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string.isRequired,
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        objects:            PropTypes.object,
        states:             PropTypes.object,
        onCollectIds:       PropTypes.func,
        enumNames:          PropTypes.array,
        ids:                PropTypes.object.isRequired,
        settings:           PropTypes.object
    };

    constructor(props) {
        super(props);

        this.ids = this.props.ids;

        for (const id in this.ids) {
            if (this.ids.hasOwnProperty(id) && this.ids[id]) {
                this.subscribes = this.subscribes || [];
                if (this.ids[id] instanceof Array) {
                    this.ids[id].forEach(i => this.subscribes.push(i));
                } else {
                    this.subscribes.push(this.ids[id]);
                }
            }
        }

        this.stateRx.chartOpened = false;

        this.setMaxHeight();
        this.dialogStyle = {
            overflowY: 'auto'
        };

        if (!this.ids.title) {
            this.getHeader = null;
        }

        const enums = [];
        this.props.enumNames.forEach(e => !enums.includes(e) && enums.push(e));
        if (!enums.includes(this.props.name)) {
            enums.push(this.props.name);
        }
        this.name = enums.join(' / ');
        this.collectState = null;
        this.collectTimer = null;

        this.componentReady();
    }

    setMaxHeight(states) {
        let maxHeight = 0;
        states = states || this.state;

        this.divs = {
            'header':   {height: HEIGHT_HEADER, visible: true},
            'icon':     {height: HEIGHT_ICON,   visible: true},
            'date':     {height: HEIGHT_DATE,   visible: true},
            'title':    {height: HEIGHT_TITLE,  visible: states && states[this.ids.title]},
            'info':     {height: HEIGHT_INFO,   visible: states && states[this.ids.info]},
            'desc':     {height: HEIGHT_DESC,   visible: states && states[this.ids.description]}
        };

        // calculate height
        for (const name in this.divs) {
            if (this.divs.hasOwnProperty(name) && this.divs[name].visible) {
                maxHeight += this.divs[name].height + 16;
            }
        }

        if (this.dialogStyle.maxHeight !== maxHeight) {
            this.dialogStyle = {maxHeight: maxHeight};
        }
    }

    onUpdateTimer() {
        this.collectTimer = null;
        if (this.collectState) {
            this.setMaxHeight(this.collectState);
            this.setState(this.collectState);
            this.collectState = null;
        }
    }

    updateState(id, state) {
        if (!id || !state) {
            return;
        }
        if (id === this.ids.title ||
            id === this.ids.info ||
            id === this.ids.start ||
            id === this.ids.description ||
            id === this.ids.end ||
            id === this.ids.icon) {
            this.collectState = this.collectState || {};
            this.collectState[id] = state.val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else
        if (id === this.ids.warning) {
            const val = parseInt(state.val, 10) || 0;
            this.collectState = this.collectState || {};
            this.collectState[id] = val || '';
            this.collectTimer && clearTimeout(this.collectTimer);
            this.collectTimer = setTimeout(() => this.onUpdateTimer(), 200);
        } else {
            console.log(id + ' => ' + state.val);
            super.updateState(id, state);
        }
    }

    onOpenNewWindow() {
        if (this.ids.icon && this.state[this.ids.icon]) {
            const win = window.open(this.state[this.ids.icon], '_blank');
            win.focus();
        }
    }

    getIconDiv() {
        if (!this.ids.icon || !this.state[this.ids.icon]) {
            return null;
        }
        const chart = this.state[this.ids.icon];

        return [<Paper
                key="icon"
                className={this.props.classes['icon-div']}
                style={{backgroundImage: 'url(' + chart + ')'}}
                onClick={() => this.setState({chartOpened: true})}
            >
                &nbsp;
            </Paper>,
            this.state.chartOpened ? <Dialog
                key="chart-dialog"
                open={true}
                classes={{paper: this.props.classes['chart-dialog-paper']}}
                onClose={() => this.setState({chartOpened: false})}
                className={this.props.classes['chart-dialog']}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{I18n.t('Chart')}</DialogTitle>
                <DialogContent
                    className={this.props.classes['chart-dialog-content']}
                    onClick={() => this.onOpenNewWindow()}
                    style={{backgroundImage: 'url(' + chart + ')'}}
                >
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.setState({chartOpened: false})}
                        color="primary"
                        autoFocus
                        variant="contained"
                        startIcon={<IconClose/>}
                    >{I18n.t('Close')}</Button>
                </DialogActions>
            </Dialog> : null];
    }

    getDateDiv() {
        const classes = this.props.classes;
        let start = this.ids.start && this.state[this.ids.start];
        let end   = this.ids.end   && this.state[this.ids.end];

        if (start || end) {
            return <div key="date" className={classes['date-div']}>
                <div className={classes['date-start']}>{start + (end ? ' - ' + end : '')}</div>
            </div>;
        } else {
            return null;
        }
    }

    /*getTitleDiv() {
        const classes = this.props.classes;
        let title = this.ids.title && this.state[this.ids.title];

        return <div key="title" className={classes['title-div']}>
            <div className={classes['title-text']}>{title}</div>
        </div>;
    }*/

    getHeader = () => this.ids.title && (this.state[this.ids.title] || null);

    getInfoDiv() {
        const classes = this.props.classes;
        let info = this.ids.info && this.state[this.ids.info];

        return <div key="info" className={classes['info-div']}>
            <div className={classes['info-text']}>{info}</div>
        </div>;
    }

    getDescDiv() {
        const classes = this.props.classes;
        let info = this.ids.description && this.state[this.ids.description];

        return <div key="desc" className={classes['desc-div']}>
            <div className={classes['desc-text']}>{info}</div>
        </div>;
    }

    generateContent() {
        return [
            //this.getHeaderDiv(),
            //this.getTitleDiv(),
            this.getDateDiv(),
            this.getInfoDiv(),
            this.getIconDiv(),
            this.getDescDiv()
        ];
    }
}

export default withStyles(styles)(SmartDialogWarning);
