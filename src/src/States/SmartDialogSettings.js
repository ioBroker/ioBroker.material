import React from 'react';
import PropTypes from 'prop-types';
import Theme from '../theme';
import I18n from '../i18n';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';

import OkIcon from 'react-icons/lib/md/save';

import ColorPicker from '../basic-controls/react-color-picker/ColorPicker';
import ImageSelector from '../basic-controls/react-image-selector/ImageSelector';
import ChipsControl from '../basic-controls/react-info-controls/ChipsControl';
import SelectControl from '../basic-controls/react-info-controls/SelectControl';
import BoolControl from '../basic-controls/react-info-controls/BoolControl';

import SmartDialogGeneric from './SmartDialogGeneric';

class SmartDialogSettings extends SmartDialogGeneric  {

    // expected:
    //      settings - array of [{id, icon, color, ...}]
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        getImages:          PropTypes.func,
        dialogKey:          PropTypes.string,
        windowWidth:        PropTypes.number,
        settings:           PropTypes.array.isRequired,
        onSave:             PropTypes.func.isRequired,
        onClose:            PropTypes.func
    };

    constructor(props) {
        super(props);
        this.stateRx.changed = false;
        this.stateRx.unsavedDialog = false;
        this.stateRx.values = {

        };
        this.stateRx.images = [];

        this.props.settings.forEach(e => {
            this.stateRx.values[e.name] = e.value === '__default__' ? '' : e.value;
        });

        // This is asynchronous
        this.props.getImages && this.props.getImages(function(images) {
            this.setState({images});
        }.bind(this));

        this.dialogStyle = Theme.dialog.settingsBack;

        this.componentReady();
    }

    onClose() {
        if (!super.mayClose()) return;

        if (!this.ignoreUnsaved && this.isChanged()) {
            this.setState({unsavedDialog: true});
        } else {
            super.onClose(true);
        }
    }

    onSave() {
        const settings = {};
        this.props.settings.forEach(item => {
            settings[item.name] = this.state.values[item.name];
        });
        this.props.onSave(settings);
        this.ignoreUnsaved = true;
        this.onClose();
    }

    handleWarningCancel = () => {
        this.ignoreUnsaved = false;
        this.click = Date.now();
        this.setState({unsavedDialog: false});
    };

    handleWarningIgnore = () => {
        this.ignoreUnsaved = true;
        this.setState({unsavedDialog: false});
        this.click = 0;
        this.onClose();
    };

    handleText(name, ev) {
        const newValue = {values: JSON.parse(JSON.stringify(this.state.values))};
        this.click = Date.now();
        newValue.values[name] = ev.target.value;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleToggle(name, ev) {
        const newValue = {values: JSON.parse(JSON.stringify(this.state.values))};
        this.click = Date.now();
        newValue.values[name] = ev.target.checked;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleValue(name, value) {
        const newValue = {values: JSON.parse(JSON.stringify(this.state.values))};
        this.click = Date.now();
        newValue.values[name] = value;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }

    handleUploadImage(name, files, pictures) {
        const newValue = {values: JSON.parse(JSON.stringify(this.state.values))};
        this.click = Date.now();
        newValue.values[name] = pictures[pictures.length - 1];
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
    }
    handleDropImage(name, file) {
        const newValue = {values: JSON.parse(JSON.stringify(this.state.values))};
        this.click = Date.now();
        newValue.values[name] = file;
        newValue.changed = this.isChanged(name, newValue.values[name]);
        this.setState(newValue);
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

    generateContent() {
        const result = this.props.settings.map((e, i) => {
            const divider = i !== this.props.settings.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null;

            let item;
            if (e.type === 'boolean') {
                /*item = [(<span key={this.props.dialogKey + '-' + e.name + '-checkbox-name'}>{I18n.t(e.name)}</span>),
                    (<Switch
                        key={this.props.dialogKey + '-' + e.name + '-checkbox'}
                        checked={this.state.values[e.name] || false}
                        onChange={ev => this.handleToggle(e.name, ev)}
                        value={e.name}
                    />)];*/
                item = (<BoolControl
                            key={this.props.dialogKey + '-' + e.name + '-bool'}
                            label={I18n.t(e.name)}
                            onChange={color => this.handleValue(e.name, color)}
                            language={this.props.language}
                            value={this.state.values[e.name] || false}
                        />);
            } else if (e.type === 'color') {
                item = (<ColorPicker
                            key={this.props.dialogKey + '-' + e.name + '-color'}
                            name={I18n.t(e.name)}
                            color={this.state.values[e.name] || ''}
                            onChange={color => this.handleValue(e.name, color)}
                        />);
            } else if (e.type === 'chips') {
                item = (<ChipsControl
                    label={I18n.t(e.name)}
                    textAdd={I18n.t('add indicator')}
                    value={this.state.values[e.name] || ''}
                    onChange={value => this.handleValue(e.name, value)}
                />);
            } else if (e.type === 'select') {
                item = (<SelectControl
                    value={this.state.values[e.name] || ''}
                    onChange={value => this.handleValue(e.name, value)}
                    label={I18n.t(e.name)}
                    options={e.options}
                />);
            } else if (e.type === 'icon') {
                item = (<ImageSelector
                    maxSize={15000}
                    icons={true}
                    height={64}
                    accept={'image/jpeg, image/png, image/gif, image/svg+xml'}
                    key={this.props.dialogKey + '-' + e.name + '-icon'}
                    label={e.label ? I18n.t(e.label) : I18n.t(e.name)}
                    image={this.state.values[e.name]}
                    maxHeight={200}
                    onUpload={file => this.handleDropImage(e.name, file)}
                    textAccepted={I18n.t('All files will be accepted')}
                    textRejected={I18n.t('Some files will be rejected')}
                    textWaiting={I18n.t('Drop some files here or click...')}
                />);
            } else if (e.type === 'image') {
                item = (<ImageSelector
                    maxSize={6000000}
                    images={this.state.images}
                    key={this.props.dialogKey + '-' + e.name + '-image'}
                    label={e.label ? I18n.t(e.label) : I18n.t(e.name)}
                    maxHeight={200}
                    image={this.state.values[e.name]}
                    onUpload={file => this.handleDropImage(e.name, file)}
                    textAccepted={I18n.t('All files will be accepted')}
                    textRejected={I18n.t('Some files will be rejected')}
                    textWaiting={I18n.t('Drop some files here or click...')}
                />);
            } else if (e.type === 'number') {
                // input field
                item = (<TextField
                    key={this.props.dialogKey + '-' + e.name + '-text'}
                    id={e.name}
                    label={I18n.t(e.name)}
                    style={{width: '100%'}}
                    type="number"
                    inputProps={{min: e.min, max: e.max}}
                    value={this.state.values[e.name] || ''}
                    onChange={ev => this.handleText(e.name, ev)}
                    margin="normal"
                />);
            } else {
                // input field
                item = (<TextField
                    key={this.props.dialogKey + '-' + e.name + '-text'}
                    id={e.name}
                    label={I18n.t(e.name)}
                    style={{width: '100%'}}
                    value={this.state.values[e.name] || ''}
                    onChange={ev => this.handleText(e.name, ev)}
                    margin="normal"
                />);
            }

            if (0 && divider) {
                return [item, divider];
            } else {
                return (<Paper key={this.props.dialogKey + '-' + e.name + '-paper'} style={{margin: 5, padding: 5}} elevation={1}>{item}</Paper>);
            }
        });
        return [
            (<Toolbar key={this.props.dialogKey + '-toolbar'} >
                <h4   key={this.props.dialogKey + '-header'} style={Theme.dialog.header}>{this.props.name}</h4>
                <Button onClick={this.onSave.bind(this)}  key={this.props.dialogKey + '-ok'} style={Theme.dialog.saveButton}  disabled={!this.state.changed} variant="extendedFab" color="primary"   aria-label="save"><OkIcon />{I18n.t('Save')}</Button>
            </Toolbar>),
            (<List key={this.props.dialogKey + '-list'} style={Theme.dialog.list}>{result}</List>)
        ];
    }

    getAdditionalElements() {
        return (<Dialog
            style={{zIndex: 2101}}
            open={this.state.unsavedDialog}
            aria-labelledby={I18n.t('Not saved!')}
            aria-describedby={I18n.t('Changes not saved!')}
        >
            <DialogTitle id="alert-dialog-title">{I18n.t('Ignore changes?')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{I18n.t('Changes are not saved.')}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleWarningCancel.bind(this)} color="primary" autoFocus>{I18n.t('Stay edit')}</Button>
                <Button onClick={this.handleWarningIgnore.bind(this)} color="secondary">{I18n.t('Discard changes')}</Button>
            </DialogActions>
        </Dialog>);
    }
}

export default SmartDialogSettings;