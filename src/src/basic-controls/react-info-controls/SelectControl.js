import React from 'react';
import PropTypes from 'prop-types';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import {withStyles} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import Theme from '../../theme';

const styles = () => (Theme.dialog.info);

// expected
// options = [
//      {label: 'Group1',
//       children: [{value: 'item1', label: 'Item 1'}, 'item2']
//      },
//      {value: 'item3', label: 'Item 3'},
//      'item4'
// }

// todo rebuild with only on level
function getOptions(options) {
    return options.map(opt => {
        if (typeof opt === 'object' && opt.hasOwnProperty('children')) {
            return (<optgroup key={opt.label} label={opt.label}>{getOptions(opt.children)}</optgroup>);
        } else if (typeof opt === 'object') {
            return (<option key={opt.value} value={opt.value}>{opt.label}</option>);
        } else {
            return (<option key={opt} value={opt}>{opt}</option>);
        }
    })
}

const SelectControl = ({classes, label, value, onChange, options}) => {
    return (<div className={classes.line}>
        <InputLabel htmlFor="selection" className={classes.subTitle}>{label}</InputLabel>
        <NativeSelect
            className={classes.line}
            value={value}
            onChange={event => onChange(event.target.value)}
            input={<Input name="selection" id="selection" />}
        >
            {getOptions(options)}
        </NativeSelect>
    </div>);
};

SelectControl.propTypes = {
    classes:    PropTypes.object.isRequired,
    label:      PropTypes.string.isRequired,
    value:      PropTypes.object.isRequired,
    options:    PropTypes.array.isRequired,
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(SelectControl);