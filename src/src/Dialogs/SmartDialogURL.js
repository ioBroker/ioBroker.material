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
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';

import SmartDialogGeneric from './SmartDialogGeneric';

const HEIGHT_TITLE  = 64;
const HEIGHT_IFRAME  = 300;

const styles = {
    'header-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        marginBottom: 16
    },
    'title-div': {
        width: 'calc(100% - 1em)',
        position: 'relative',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 16,
    },
    'title-text': {
        color: 'black'
    },

    'iframe-div': {
        width: 'calc(100% - 1em)',
        minHeight: HEIGHT_IFRAME,
        height: 'calc(100% - ' + HEIGHT_TITLE + 'px)'
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 0
    },
    'image-img': {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },

};

class SmartDialogURL extends SmartDialogGeneric  {
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
        settings:           PropTypes.object,
        image:              PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.ids = this.props.ids;

        this.setMaxHeight();
        this.dialogStyle = {overflowY: 'auto'};
        this.stateRx.url = this.getUrl(this.props.settings.background);

        if (this.props.settings.fullWidth) {
            this.dialogStyle = {width: 'calc(100% - 4rem)', maxWidth: 'calc(100% - 4rem)', left: '2rem'};
        }

        this.componentReady();
    }

    getUrl(url) {
        let _url;
        if (this.props.image && url) {
            if (url.indexOf('?') !== -1) {
                _url = url + '&ts=' + Date.now();
            } else {
                _url = url + '?ts=' + Date.now();
            }
            return _url;
        } else {
            return url;
        }
    }

    setMaxHeight(states) {
        let maxHeight = 0;
        states = states || this.state;

        this.divs = {
            'title':    {height: HEIGHT_TITLE,  visible: !!this.props.settings.title},
            'iframe':   {height: HEIGHT_IFRAME, visible: true}
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

    updateUrl() {
        if (this.props.image) {
            this.setState({url: this.getUrl(this.props.settings.background)});
        }
    }

    componentDidMount () {
        document.getElementById('root').className = `blurDialogOpen`;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.props.settings.updateInDialog || this.props.settings.update) {
            this.interval = setInterval(() => this.updateUrl(), this.props.settings.updateInDialog || this.props.settings.update);
        }
    }

    componentWillUnmount() {
        document.getElementById('root').className = ``;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    onOpenNewWindow() {
        if (this.props.settings.background) {
            const win = window.open(this.props.settings.background, '_blank');
            win.focus();
        }
    }

    getHeader = this.props.settings.title ? () => this.props.settings.title : null;

    /*getTitleDiv() {
        const classes = this.props.classes;
        let title = this.props.settings.title;

        if (title) {
            return (<div key="title" className={classes['title-div']}>
                <div className={classes['title-text']}>{title}</div>
            </div>);
        } else {
            return null;
        }
    }*/

    getIFrameDiv() {
        const style = {height: 'calc(100% - ' + (this.props.settings.title ? HEIGHT_TITLE : '0') + 'px)'};
        if (!this.props.image && this.state.url) {
            return <Paper onClick={() => this.onOpenNewWindow()} className={this.props.classes['iframe-div']} style={style}>
                <iframe className={this.props.classes['iframe']} title={this.state.url} src={this.state.url}/>
            </Paper>;
        } else if (this.state.url) {
            return <Paper key="image"  style={style} onClick={() => this.onOpenNewWindow()} className={this.props.classes['iframe-div']}>
                <img className={this.props.classes['image-img']} alt="" src={this.state.url}/>
            </Paper>;
        }
    }

    generateContent() {
        return [
            //this.getTitleDiv(),
            this.getIFrameDiv()
        ];
    }
}

export default withStyles(styles)(SmartDialogURL);
