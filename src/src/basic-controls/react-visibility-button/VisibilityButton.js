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
import React from 'react'
import PropTypes from 'prop-types';

import {MdVisibility as IconCheck} from 'react-icons/md';
import {MdVisibilityOff as IconUncheck} from 'react-icons/md';
import IconButton from '@material-ui/core/IconButton';

const styles = {
    button: {
        color: 'black'
    },
    buttonSmall: {
        width: 20,
        height: 20,
        borderRadius: 20,
        position: 'absolute',
        top: 0,
        right: 0,
        color: 'black'
    },
    buttonBig: {
        width: 24,
        height: 24,
        borderRadius: 24
    }
};

class SmallVisibilityButton extends React.Component {
    static propTypes = {
        visible:    PropTypes.bool,
        big:        PropTypes.bool,
        useBright:  PropTypes.bool,
        style:      PropTypes.object,
        onChange:   PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible
        };
    }

    toggleState = (e) => {
        e.stopPropagation();
        this.props.onChange && this.props.onChange(!this.state.visible);
        this.setState({visible: !this.state.visible});
    };

    render() {
        if (this.props.big) {
            return (<IconButton onClick={e => this.toggleState(e)}  style={Object.assign({}, styles.button, styles.buttonBig, this.props.useBright ? {color: 'white'} : {color: 'black'}, this.props.style || {})}>
                {this.state.visible ? <IconCheck width={'100%'}/> : <IconUncheck width={'100%'}/>}
            </IconButton>);
        } else {
            const iconStyle = {marginTop: -3, verticalAlign: 'top'};
            return (
                <div style={Object.assign({}, styles.button, styles.buttonSmall, this.props.useBright ? {color: 'white'} : {color: 'black'}, this.props.style || {})} onClick={e => this.toggleState(e)} className="small-visibility-button">
                    {this.state.visible ? <IconCheck width={16} style={iconStyle}/> : <IconUncheck width={16} style={iconStyle}/>}
                </div>
            )
        }
    }
}

export default SmallVisibilityButton