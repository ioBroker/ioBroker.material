import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import {withStyles} from '@material-ui/core/styles';
import Moment from 'react-moment';

const styles = theme => ({
    line: {
        width: '100%'
    },
    floatRight: {
        float: 'right'
    },
    label: {
        display: 'inline-block',
        lineHeight: '48px'
    },
    ts: {
        fontSize: 12,
        paddingLeft: 16,
        float: 'right',
        lineHeight: '48px'
    },
    icon: {
        height: 20,
        marginRight: 10
    }
});

const BoolControl = ({classes, label, value, ts, onChange, language, icon}) => {
    let Icon;
    if (icon) {
        if (typeof icon === 'object') {
            Icon = icon;
            Icon = (<Icon className={classes.icon} />);
        } else {
            Icon = (<img alt={label} src={icon} className={classes.icon}/>);
        }
    }

    return (<div className={classes.line}>
        <Typography className={classes.label}>
            {Icon}
            {label}
            </Typography>
        <Switch
            className={classes.floatRight}
            checked={value}
            disabled={!onChange}
            onChange={() => onChange && onChange()}
        />
        {ts ? (<Moment className={classes.ts} date={ts} interval={15} fromNow locale={language}/>) : null}
    </div>);
};

BoolControl.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.bool.isRequired,
    language:   PropTypes.string.isRequired,
    ts:         PropTypes.number,
    icon:       PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(BoolControl);