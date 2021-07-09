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
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Theme from '../../theme';
import cls from './style.module.scss';
import IconAdapter from '@iobroker/adapter-react/Components/Icon';

const styles = () => (Theme.dialog.info);

const InfoControl = ({ classes, label, value, onChange, language, icon, unit, chart, id, role }) => {
    let Icon;
    if (icon) {
        if (typeof icon === 'object') {
            Icon = icon;
        } else {
            Icon = <img alt={label} src={icon} className={classes.icon} />;
        }
    }
    const ref = useRef();
    return <Typography component="div" className={cls.line}>
        <span className={cls.label}>
            <div style={{ marginRight: 3, display: 'inherit' }}>
                {Icon}
            </div>
            {label}
        </span>
        {chart && chart(id, ref, {
            root: cls.rootChartStyle,
            name: cls.nameChartStyle,
            chart: cls.chartStyle,
        })}
        <span className={cls.displayFlex}>
            <div className={cls.valueUnit}>
                <span className={classes.value}>{value && value.val !== undefined && value.val !== null ? role === 'image'?<IconAdapter src={value.val} className={cls.imageNew}/>:value.val.toString() : '?'}</span>
                {unit && <span className={cls.unit}>{unit}</span>}
            </div>
            {value && value.lc && <Moment className={classes.lc} date={value.lc} interval={15} fromNow locale={language} />}
        </span>
    </Typography>;
};

InfoControl.propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    unit: PropTypes.string,
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange: PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(InfoControl);
