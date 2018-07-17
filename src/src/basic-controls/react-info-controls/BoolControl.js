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
            Icon = (<Icon className={classes.icon} />);
        } else {
            Icon = (<img alt={label} src={icon} className={classes.icon}/>);
        }
    }

    return (<div className={classes.line}>
        <Typography className={classes.label} style={{lineHeight: '45px'}}>
            {Icon}
            {label}
        </Typography>
        <Switch
            className={classes.floatRight}
            style={{float: 'right'}}
            checked={value && value.val}
            disabled={!onChange}
            onChange={() => onChange && onChange()}
        />
        {value && value.lc ? (<Moment className={classes.lc} date={value.lc} interval={15} fromNow locale={language}/>) : null}
    </div>);
};

BoolControl.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.object.isRequired,
    language:   PropTypes.string.isRequired,
    icon:       PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(BoolControl);