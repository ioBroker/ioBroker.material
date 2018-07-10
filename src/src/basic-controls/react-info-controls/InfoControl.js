import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import Moment from 'react-moment';
import Theme from '../../theme';

const styles = () => (Theme.dialog.info);

const InfoControl = ({classes, label, value, onChange, language, icon, unit}) => {
    let Icon;
    if (icon) {
        if (typeof icon === 'object') {
            Icon = icon;
            Icon = (<Icon className={classes.icon} />);
        } else {
            Icon = (<img alt={label} src={icon} className={classes.icon}/>);
        }
    }

    return (
        <div className={classes.line}>
            {Icon}
            <Typography>
                <span className={classes.label}>{label}</span>
                <span className={classes.valueUnit}>
                    <span className={classes.value}>{value && value.val !== undefined && value.val !== null ? value.val.toString() : '?'}</span>
                    {unit && (<span className={classes.unit}>{unit}</span>)}
                </span>
                {value && value.lc && (<Moment className={classes.lc} date={value.lc} interval={15} fromNow locale={language}/>)}
            </Typography>
        </div>
    );
};

InfoControl.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.object.isRequired,
    language:   PropTypes.string.isRequired,
    unit:       PropTypes.string,
    icon:       PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(InfoControl);