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
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import I18n from './i18n';
import PropTypes from 'prop-types';

class SpeechDialog extends Component {
    static propTypes = {
        isShow: PropTypes.bool.isRequired,
        objects: PropTypes.object.isRequired,
        onFinished: PropTypes.func.isRequired,
        locale: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.speech = null;
        this.state = {
            interimTranscript: '',
            finalTranscript: '',
            isListening: false
        };
        this.isShow = null;
    }

    getVoices() {
        if (!window.SpeechSynthesisUtterance)
            return [];

        return speechSynthesis.getVoices();
    }

    static isSpeechRecognitionSupported() {
        return !!window.webkitSpeechRecognition;
    }

    componentDidUpdate() {
        if (this.isShow !== this.props.isShow) {
            this.isShow = this.props.isShow;

            if (this.props.isShow) {
                this.setState({isListening: true});
                this.startSpeechRecognition();
            }
        }
    }

    startSpeechRecognition() {
        this.speech = SpeechDialog.isSpeechRecognitionSupported() ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;
        this.setState({
            interimTranscript: '',
            finalTranscript: ''
        });

        this.locale = this.props.locale;

        if (!this.speech || !this.locale) {
            return;
        }

        this.speech.continuous = false;
        this.speech.interimResults = true;
        this.speech.lang = this.locale;

        this.speech.onresult = (e) => {
            let interimTranscript = '';
            let finalTranscript = '';

            if (typeof (e.results) === 'undefined') {
                this.speech.onend = null;
                this.speech.stop();
                return;
            }

            for (let i = e.resultIndex; i < e.results.length; ++i) {
                let val = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalTranscript += ' ' + val;
                } else {
                    interimTranscript += ' ' + val;
                }
            }

            if (this.stopTimer) {
                clearTimeout(this.stopTimer);
                this.stopTimer = null;
            }

            if (finalTranscript) {
                this.setState({finalTranscript: finalTranscript, interimTranscript: interimTranscript});
                this.speech && this.speech.stop();
                console.log(new Date () + ' - Listening final results');
            } else {
                this.setState({interimTranscript: interimTranscript});
                this.stopTimer = setTimeout(() => {
                    if (this.speech) {
                        this.speech.onresult = null;
                        this.speech.end = null;
                        this.speech.stop();
                        this.speech = null;
                    }
                }, 3000);
            }
        };

        this.speech.onend = (e) => {
            console.log(new Date () + ' - Listening onend');
            this.stopSpeechRecognition();
        };

        this.speech.onerror = (e) => {
            console.log(new Date () + ' - Listening onend: ' + e.error);
            this.stopSpeechRecognition();
        };

        console.log(new Date () + ' - Listening Start');
        this.speech.start();
    }

    stopSpeechRecognition(isImmediately) {
        if (this.speech) {
            this.speech.onend    = null;
            this.speech.onresult = null;
            this.speech.stop();
            this.speech = null;
            console.log(new Date () + ' - Listening stopSpeechRecognition');
        }
        if (this.state.finalTranscript) this.props.onSpeech(this.state.finalTranscript);
        if (isImmediately) {
            this.setState({isListening: false});
            this.props.onFinished && this.props.onFinished();
        } else {
            setTimeout(() => {
                this.setState({isListening: false});
                this.props.onFinished && this.props.onFinished();
            }, 2000);
        }
    }

    render() {
        const actions = [
            <Button
                variant="outlined"
                label="Cancel"
                primary={true}
                onClick={() => this.stopSpeechRecognition(true)}
            />
        ];

        return (<Dialog
            title={I18n.t('Speech recognition running...')}
            actions={actions}
            modal={true}
            open={this.props.isShow}
        >
            {this.state.finalTranscript ? <span style={{color: '#333333', fontWeight: 'bold'}}>{this.state.finalTranscript}</span> : (this.state.interimTranscript || I18n.t('Listening...'))}
        </Dialog>);
    }

}

export default SpeechDialog;