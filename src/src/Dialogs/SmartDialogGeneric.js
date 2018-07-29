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
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Theme from '../theme';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from 'react-icons/lib/md/close';
import Button from '@material-ui/core/Button';
import I18n from '../i18n';

class SmartDialogGeneric extends Component  {
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
        window.addEventListener('contextmenu', SmartDialogGeneric.onContextMenu, false);
        this.refModal = React.createRef();
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
        if (this.refModal) {
            this.savedParent = this.refModal.current.parentElement;
            document.body.appendChild(this.refModal.current);
        }

        if (this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }

        if (!this.positionTuned) {
            Object.assign(this.dialogStyle, {left: 'calc(50% - ' + (this.refModal.current.firstChild.offsetWidth / 2) + 'px)'});
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        this.refModal && this.savedParent.appendChild(this.refModal.current);

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
            window.removeEventListener('contextmenu', SmartDialogGeneric.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }

    handleToastClose() {
        this.setState({toast: ''});
    }

    generateContent() {
        return null;
    }

    onClick(e) {
        if (!this.closeOnPaperClick) {
            e && e.stopPropagation();
            this.click = Date.now();
        }
    }

    showCloseButton() {
        if (this.props.windowWidth < 500) {
            return (<Button variant="fab"
                            aria-label={I18n.t('close')}
                            onClick={() => this.onClose(true)}
                            style={Theme.dialog.closeButton}>
                <CloseIcon />
            </Button>)
        } else {
            return null;
        }
    }

    render() {
        return (<div key={this.props.dialogKey + '-dialog'}
                     ref={this.refModal}
                     onClick={() => this.onClose()}
                     style={Theme.dialog.back}>
                <Paper onClick={this.onClick.bind(this)}
                       style={Object.assign({}, Theme.dialog.inner, this.dialogStyle)}
                >
                    {this.generateContent()}
                    <Snackbar
                        key={this.props.dialogKey + '-toast'}
                        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                        open={!!this.state.toast}
                        onClick={this.handleToastClose.bind(this)}
                        onClose={this.handleToastClose.bind(this)}
                        autoHideDuration={4000}
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={<span id="message-id">{this.state.toast}</span>}
                    />
                    {this.showCloseButton()}
                </Paper>

            {this.getAdditionalElements && this.getAdditionalElements()}

        </div>);
    }
}

//export default withStyles(styles)(SmartDialogGeneric);
export default SmartDialogGeneric;