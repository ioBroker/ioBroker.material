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
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = {
    progress:{
        position: 'absolute',
        top: '50%',
        width: '60%',
        left: '20%'
    },
    progressText:{
        position: 'absolute',
        top: 'calc(50% + 10px)',
        left: 0,
        width: '100%',
        textAlign: 'center'
    }
};
const LoadingIndicator = ({classes, label, value, color, variant}) => {
    return [
        <LinearProgress key="progress" variant={variant || 'determinate'} className={classes.progress} value={value} />,
        <div key="text" className={classes.progressText} style={{color: color}}>{label}</div>
    ];
};

LoadingIndicator.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    variant:    PropTypes.string,
    value:      PropTypes.number.isRequired,
    background: PropTypes.string
};

export default withStyles(styles)(LoadingIndicator);
