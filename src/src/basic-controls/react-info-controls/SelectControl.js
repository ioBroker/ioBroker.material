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
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
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

const SelectControl = ({ classes, label, value, onChange, options }) => {
    if (typeof value === 'object' && value.value !== undefined) {
        value = value.value;
    }

    return <div className={classes.line}>
        <InputLabel htmlFor="selection">{label}</InputLabel>
        <NativeSelect
            className={classes.line}
            value={value}
            onChange={event => onChange(event.target.value)}
            input={<Input value={value} name="selection" id="selection" />}
        >
            {getOptions(options)}
        </NativeSelect>
    </div>;
};

SelectControl.propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func // if no onChange => readOnly
};

export default withStyles(styles)(SelectControl);
