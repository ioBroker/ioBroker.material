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
 * WITHOUT WARRANTIES OR CONDITIOselectNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';

import { MdSave as OkIcon } from 'react-icons/md';
import { MdContentCopy as CopyIcon } from 'react-icons/md';
import { MdCancel as IconCancel } from 'react-icons/md';

import Utils from '@iobroker/adapter-react/Components/Utils';

import ColorPicker from '../basic-controls/react-color-picker/ColorPicker';
import ImageSelector from '../basic-controls/react-image-selector/ImageSelector';
import ChipsControl from '../basic-controls/react-info-controls/ChipsControl';
import SelectControl from '../basic-controls/react-info-controls/SelectControl';
import BoolControl from '../basic-controls/react-info-controls/BoolControl';

import SmartDialogGeneric from './SmartDialogGeneric';
import Theme from '../theme';
import I18n from '@iobroker/adapter-react/i18n';
import UploadImage from '../basic-controls/UploadImage';
import CustomButton from '../States/components/CustomButton';
import CustomFab from '../States/components/CustomFab';

const styles = {
    descCopyIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        background: 'rgba(255,255,255,0.7)',
        padding: 0
    },
    descDivId: {
        fontSize: 'smaller'
    },
    descTitle: {
        fontWeight: 'bold'
    },
    descCopied: {
        position: 'absolute',
        top: 3,
        right: 3,
        background: 'white'
    }
};

class SmartDialogSettings extends SmartDialogGeneric {

    // expected:
    //      settings - array of [{id, icon, color, ...}]
    static propTypes = {
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        getImages: PropTypes.func,
        dialogKey: PropTypes.string,
        windowWidth: PropTypes.number,
        settings: PropTypes.array.isRequired,
        objectInfo: PropTypes.object,
        onSave: PropTypes.func.isRequired,
        onClose: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.stateRx.changed = false;
        this.stateRx.unsavedDialog = false;
        this.stateRx.values = {

        };
        this.stateRx.images = [];
        this.stateRx.anchorEl = null;

        this.props.settings.forEach(e => {
            this.stateRx.values[e.name] = e.value === '__default__' ? '' : e.value;
        });

        // This is asynchronous
        this.props.getImages && this.props.getImages(function (images) {
            this.setState({ images });
        }.bind(this));

        this.dialogStyle = Theme.dialog.settingsBack;

        this.componentReady();
    }

    onClose() {
        if (!super.mayClose()) return;

        if (!this.ignoreUnsaved && this.isChanged()) {
            this.setState({ unsavedDialog: true });
        } else {
            super.onClose(true);
        }
    }

    onSave = () => {
        const settings = {};
        this.props.settings.forEach(item => {
            settings[item.name] = this.state.values[item.name];
        });
        this.props.onSave(settings);
        this.ignoreUnsaved = true;
        this.onClose();
    };

    handleWarningCancel = () => {
        this.ignoreUnsaved = false;
        this.click = Date.now();
        this.setState({ unsavedDialog: false });
    };

    handleWarningIgnore = () => {
        this.ignoreUnsaved = true;
        this.setState({ unsavedDialog: false });
        this.click = 0;
        this.onClose();
    };

    handleText(name, ev) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = ev.target.value;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleToggle(name, ev) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = ev ? ev.target.checked : !this.state.values[name];
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleValue(name, value) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = value;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleUploadImage(name, files, pictures) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = pictures[pictures.length - 1];
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }
    handleDropImage(name, file) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = file;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleIcon(name, file) {
        const newValue = { values: JSON.parse(JSON.stringify(this.state.values)) };
        this.click = Date.now();
        newValue.values[name] = typeof file === 'object' ? file.data : file;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    onDelete() {
        this.props.onSave(false);
        this.ignoreUnsaved = true;
        this.onClose();
    }

    isChanged(name, newVal) {
        return !!this.props.settings.find(item => {
            if (item.name === name) {
                return newVal !== item.value;
            } else {
                return item.value !== this.state.values[item.name]
            }
        });
    }

    copyId = event => {
        this.setState({ anchorEl: event.currentTarget });
        setTimeout(() => {
            this.setState({ anchorEl: null });
        }, 2000);
    }

    generateObjectInfo() {
        if (this.props.settingsId) {
            return (<div key={'object-info'} style={{ margin: 5, padding: 5, position: 'relative' }} elevation={1}>
                <CopyToClipboard
                    text={this.props.settingsId}>
                    <CustomFab
                        title={I18n.t('Copy ID to clipboard')}
                        onClick={this.copyId}
                        active
                        style={styles.descCopyIcon}>
                        <CopyIcon width={Theme.iconSize} height={Theme.iconSize} />
                    </CustomFab>
                </CopyToClipboard>
                {this.state.anchorEl ? (<Button variant="outlined" disabled style={styles.descCopied}>{I18n.t('Copied')}</Button>) : null}
                <div><span style={styles.descTitle}>{I18n.t('Name')}: </span>{Utils.getObjectName(this.props.objects, this.props.settingsId)}</div>
                <div style={styles.descDivId}><span style={styles.descTitle}>{I18n.t('Description')}: </span>{Utils.getObjectName(this.props.objects, this.props.settingsId, null, null, true)}</div>
                <div style={styles.descDivId}><span style={styles.descTitle}>ID: </span>{this.props.settingsId}</div>
            </div>);
        } else {
            return null;
        }
    }

    getHeader() {
        return this.props.name;
    }
    getButtons() {
        return <CustomButton active onClick={this.onSave} variant="contained" color="primary" startIcon={<OkIcon />}>{I18n.t('Save')}</CustomButton>
    }

    generateContent() {
        const result = this.props.settings.map((e, i) => {
            const divider = i !== this.props.settings.length - 1 ? <ListItem key={e.id + '_div'} style={Theme.dialog.divider} /> : null;

            let item;
            if (e.type === 'delete') {
                item = <CustomButton
                    color="secondary"
                    variant="contained"
                    key={this.props.dialogKey + '-delete'}
                    onClick={() => this.onDelete()}
                >{I18n.t('Delete')}</CustomButton>;
            } else if (e.type === 'boolean') {
                item = <BoolControl
                    key={this.props.dialogKey + '-' + e.name + '-bool'}
                    label={I18n.t(e.name)}
                    onChange={() => this.handleToggle(e.name)}
                    icon={e.icon}
                    language={I18n.getLanguage()}
                    value={this.state.values[e.name] || false}
                />;
            } else if (e.type === 'color') {
                item = <ColorPicker
                    key={this.props.dialogKey + '-' + e.name + '-color'}
                    name={I18n.t(e.name)}
                    color={this.state.values[e.name] || ''}
                    onChange={color => this.handleValue(e.name, color)}
                />;
            } else if (e.type === 'chips') {
                item = <ChipsControl
                    label={I18n.t(e.name)}
                    textAdd={I18n.t('add indicator')}
                    value={this.state.values[e.name] || ''}
                    onChange={value => this.handleValue(e.name, value)}
                />;
            } else if (e.type === 'select') {
                item = <SelectControl
                    value={this.state.values[e.name] || ''}
                    onChange={value => this.handleValue(e.name, value)}
                    label={I18n.t(e.name)}
                    options={e.options}
                />;
            } else if (e.type === 'icon') {
                item = <UploadImage
                    crop={false}
                    maxSize={15000}
                    icon={this.state.values[e.name]}
                    onChange={base64 => this.handleIcon(e.name, base64)}
                    t={I18n.t}
                />;
            } else if (e.type === 'image') {
                item = <ImageSelector
                    maxSize={6000000}
                    images={this.state.images}
                    key={this.props.dialogKey + '-' + e.name + '-image'}
                    label={e.label ? I18n.t(e.label) : I18n.t(e.name)}
                    aspect={this.state.values.hasOwnProperty('doubleSize') ? (this.state.values.doubleSize ? 2 : 1) : e.aspect}
                    maxHeight={200}
                    image={this.state.values[e.name]}
                    onUpload={file => this.handleDropImage(e.name, file)}
                    textAccepted={I18n.t('All files will be accepted')}
                    textRejected={I18n.t('Some files will be rejected')}
                    textWaiting={I18n.t('Drop some files here or click...')}
                />;
            } else if (e.type === 'number') {
                // input field
                item = <TextField
                    key={this.props.dialogKey + '-' + e.name + '-text'}
                    id={e.name}
                    label={I18n.t(e.name)}
                    style={{ width: '100%' }}
                    type="number"
                    inputProps={{ min: e.min, max: e.max }}
                    value={this.state.values[e.name] || ''}
                    onChange={ev => this.handleText(e.name, ev)}
                    margin="normal"
                />;
            } else {
                // input field
                item = <TextField
                    key={this.props.dialogKey + '-' + e.name + '-text'}
                    id={e.name}
                    label={I18n.t(e.name)}
                    style={{ width: '100%' }}
                    value={this.state.values[e.name] || ''}
                    onChange={ev => this.handleText(e.name, ev)}
                    margin="normal"
                />;
            }

            if (0 && divider) {
                return [item, divider];
            } else {
                return <div key={this.props.dialogKey + '-' + e.name + '-paper'} style={{ margin: 5, padding: 5 }} >{item}</div>;
            }
        });

        result.push(this.generateObjectInfo());

        return <List key={this.props.dialogKey + '-list'}>
            <Paper style={{backgroundColor:'transparent'}} elevation={1}>{result}</Paper>
        </List>;
        /*return [
            <Toolbar key={this.props.dialogKey + '-toolbar'} >
                <h4 key={this.props.dialogKey + '-header'} style={Theme.dialog.header}>{this.props.name}</h4>
                <Fab onClick={this.onSave.bind(this)}  key={this.props.dialogKey + '-ok'} style={Theme.dialog.saveButton}  disabled={!this.state.changed} size="small" variant="extended" color="primary"   aria-label="save"><OkIcon />{I18n.t('Save')}</Fab>
            </Toolbar>,
            <List key={this.props.dialogKey + '-list'} style={Theme.dialog.list}>{result}</List>
        ];*/
    }

    getAdditionalElements() {
        return <Dialog
            open={this.state.unsavedDialog}
            aria-labelledby={I18n.t('Not saved!')}
            aria-describedby={I18n.t('Changes not saved!')}
        >
            <DialogTitle>{I18n.t('Ignore changes?')}</DialogTitle>
            <DialogContent>
                <DialogContentText>{I18n.t('Changes are not saved.')}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleWarningCancel} color="primary" autoFocus>{I18n.t('Stay edit')}</Button>
                <Button onClick={this.handleWarningIgnore} startIcon={<IconCancel/>}>{I18n.t('Discard changes')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

export default SmartDialogSettings;
