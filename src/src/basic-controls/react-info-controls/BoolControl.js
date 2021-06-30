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
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import {withStyles} from '@material-ui/core/styles';
import Moment from 'react-moment';
import Theme from '../../theme';

const styles = () => (Theme.dialog.info);

const BoolControl = ({classes, label, value, onChange, language, icon}) => {
    let Icon;
    if (icon) {
        if (typeof icon === 'object') {
            Icon = icon;
            Icon = <Icon className={classes.icon} />;
        } else {
            Icon = <img alt={label} src={icon} className={classes.icon}/>;
        }
    }

    return <div className={classes.line}>
        <Typography className={classes.label} style={{lineHeight: '45px'}}>
            {Icon}
            {label}
        </Typography>
        <Switch
            className={classes.floatRight}
            style={{float: 'right'}}
            checked={value && typeof value === 'object' ? value.val : !!value}
            disabled={!onChange}
            onChange={() => onChange && onChange()}
        />
        {value && value.lc ? (<Moment className={classes.lc} date={value.lc} interval={15} fromNow locale={language}/>) : null}
    </div>;
};

BoolControl.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
    ]),
    language:   PropTypes.string.isRequired,
    icon:       PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(BoolControl);
