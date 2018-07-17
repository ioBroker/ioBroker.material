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

function getOptions(options, root, path) {
    root = root || [];
    path = path || '';

    const items = options.map(opt => {
        if (typeof opt === 'object' && opt.hasOwnProperty('children')) {
            const subItems = getOptions(opt.children, root, path + opt.label + '-');
            if (subItems && subItems.length) {
                root.push((<optgroup key={path + opt.label} label={opt.label}>{subItems}</optgroup>));
            }
            return null;
        } else if (typeof opt === 'object') {
            return (<option key={path + opt.value} value={opt.value}>{opt.label}</option>);
        } else {
            return (<option key={path + opt} value={opt}>{opt}</option>);
        }
    });
    if (!path) {
        items.forEach(e => e && root.push(e));
        return root;
    } else {
        return items.filter(e => e);
    }
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
    value:      PropTypes.string.isRequired,
    options:    PropTypes.array.isRequired,
    onChange:   PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(SelectControl);