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
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Theme from '../theme';
import Snackbar from '@material-ui/core/Snackbar';
import {MdClose as CloseIcon} from 'react-icons/md';
import Fab from '@material-ui/core/Fab';
import I18n from '@iobroker/adapter-react/i18n';
import {Dialog} from "@material-ui/core";
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import cls from './style.module.scss';

class SmartDialogGeneric extends Component  {

    static COLOR_MODES = {
        RGB: 0,
        HUE: 1,
        R_G_B: 2,
        TEMPERATURE: 3
    };

    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string,
        windowWidth:        PropTypes.string,

        onClose:            PropTypes.func,
        onCollectIds:       PropTypes.func
    };

    constructor(props) {
        super(props);

        this.stateRx = {
            toast: ''
        };

        // disable context menu after long click
        // window.addEventListener('contextmenu', SmartDialogGeneric.onContextMenu, false);
        //this.refModal = React.createRef();
        this.dialogStyle = {};
        this.closeOnPaperClick = false;
        this.savedParent = null;

        this.subscribes = null;
        this.subscribed = false;
        this.editMode   = this.props.editMode;
        this.positionTuned = false;

    }

    componentReady () {
        //    ↓ ignore error here
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state = this.stateRx;
        delete this.stateRx;
    }

    static onContextMenu(e) {
        if (!e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            console.log('Ignore context menu' + e);
            return false;
        }
    }

    componentDidMount() {
        // move this element to the top of body
        /*if (this.refModal) {
            this.savedParent = this.refModal.current.parentElement;
            document.body.appendChild(this.refModal.current);
        }*/

        if (this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }

        /*if (!this.positionTuned) {
            Object.assign(this.dialogStyle, {left: 'calc(50% - ' + (this.refModal.current.firstChild.offsetWidth / 2) + 'px)'});
            this.forceUpdate();
        }*/
    }

    componentWillUnmount() {
        //this.refModal && this.savedParent.appendChild(this.refModal.current);

        if (this.props.onCollectIds && this.subscribed) {
            this.props.onCollectIds(this, this.subscribes, false);
            this.subscribed = null;
        }
    }

    // default handler
    updateState(id, state) {
        const newState = {};
        if (state) {
            newState[id] = {val: state.val, ts: state.ts, lc: state.lc};
        } else {
            newState[id] = null;
        }
        this.setState(newState);
    }

    mayClose() {
        return !(this.click && Date.now() - this.click < 50);
    }

    onClose(forceClose) {
        if (forceClose || this.mayClose()) {
            // window.removeEventListener('contextmenu', SmartDialogGeneric.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }

    handleToastClose = () =>
        this.setState({toast: ''});

    generateContent() {
        return null;
    }

    onClick = e => {
        if (!this.closeOnPaperClick) {
            e && e.stopPropagation();
            this.click = Date.now();
        }
    };

    showCloseButton() {
        if (this.props.windowWidth < 500) {
            return <Fab
                size="small"
                aria-label={I18n.t('close')}
                onClick={() => this.onClose(true)}
                style={Theme.dialog.closeButtonLeft}>
                <CloseIcon />
            </Fab>;
        } else {
            return null;
        }
    }

    setDialogStyle(style) {
        this.dialogStyle = style || {};
        this.forceUpdate();
    }

    render() {
        /*return <div key={this.props.dialogKey + '-dialog'}
                     ref={this.refModal}
                     onClick={() => this.onClose()}
                     style={Theme.dialog.back}>
                <Paper onClick={this.onClick}
                   style={Object.assign({}, Theme.dialog.inner, this.dialogStyle)}
                >
                    {this.generateContent()}
                    <Snackbar
                        key={this.props.dialogKey + '-toast'}
                        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                        open={!!this.state.toast}
                        onClick={this.handleToastClose}
                        onClose={this.handleToastClose}
                        autoHideDuration={4000}
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={<span id="message-id">{this.state.toast}</span>}
                    />
                    {this.showCloseButton()}
                </Paper>

            {this.getAdditionalElements && this.getAdditionalElements()}
        </div>;*/
        return <Dialog
            fullWidth
            scroll="paper"
            classes={{paper: clsx('dialog-paper', this.props.classes?.dialogPaper, this.props.transparent && cls.paper)}}
            open={true}
            disableBackdropClick={!!this.getButtons}
            onClose={() => this.onClose()}
            maxWidth="sm"
        >
            {this.getHeader ? <DialogTitle>{this.getHeader()}</DialogTitle> : null}
            <DialogContent style={{position: 'relative'}}>
                {this.generateContent()}
            </DialogContent>
            <DialogActions>
                {this.getButtons ? this.getButtons() : null}
                {this.getButtons ?
                    <Button onClick={() => this.onClose(true)} variant="contained" autoFocus>
                        <CloseIcon style={{marginRight: 8}}/>{I18n.t('Close')}
                    </Button> :
                <Fab onClick={() => this.onClose(true)} size="small" autoFocus>
                    <CloseIcon/>{/*I18n.t('Close')*/}
                </Fab>}
            </DialogActions>
            {this.getAdditionalElements && this.getAdditionalElements()}
            <Snackbar
                key={this.props.dialogKey + '-toast'}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={!!this.state.toast}
                onClick={this.handleToastClose}
                onClose={this.handleToastClose}
                autoHideDuration={4000}
                ContentProps={{'aria-describedby': 'message-id'}}
                message={<span id="message-id">{this.state.toast}</span>}
            />
        </Dialog>
    }
}

export default SmartDialogGeneric;
