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
const LoadingIndicator = ({classes, label, value, color}) => {
    return [
        (<LinearProgress key="progress" variant="determinate" className={classes.progress} value={value} />),
        (<div key="text" className={classes.progressText} style={{color: color}}>{label}</div>)
    ];
};

LoadingIndicator.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.number.isRequired,
    background: PropTypes.string
};

export default withStyles(styles)(LoadingIndicator);