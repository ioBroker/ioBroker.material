import React, {Component} from 'react';
import Theme from '../theme';
import I18n from '../i18n';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ColorPicker from '../basic-controls/react-color-picker/ColorPicker';
import ImageSelector from '../basic-controls/react-image-selector/ImageSelector';
import OkIcon from 'react-icons/lib/md/save';
import CancelIcon from 'react-icons/lib/md/cancel';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';

class SmartDialogSettings extends Component  {

    // expected:
    //      settings - array of [{id, icon, color, ...}]
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        getImages:          PropTypes.func,
        dialogKey:          PropTypes.string,
        settings:           PropTypes.array.isRequired,
        onSave:             PropTypes.func.isRequired,
        onClose:            PropTypes.func
    };

    constructor(props) {
        super(props);
        const state = {
            toast: '',
            changed: false,
            unsavedDialog: false,
            values: {
                
            },
            images: []
        };
        this.props.settings.forEach(e => {
            state.values[e.name] = e.value === '__default__' ? '' : e.value;
        });

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogSettings.onContextMenu, false);
        this.state = state;
        this.refDialog = React.createRef();
        this.props.getImages && this.props.getImages(function(images) {
            this.setState({images});
        }.bind(this));
    }

    static onContextMenu(e) {
        if (!e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            console.log('Ignore context menu' + e);
            return false;
        }
    }

    componentDidMount() {
        // move this element to the top of body
        if (this.refDialog) {
            this.savedParent = this.refDialog.current.parentElement;
            document.body.appendChild(this.refDialog.current);
        }
    }

    componentWillUnmount() {
        this.refDialog && this.savedParent.appendChild(this.refDialog.current);
    }

    onClose() {
        const now = Date.now();
        if (this.click && now - this.click < 50) {
            return;
        }
        if (!this.ignoreUnsaved && this.isChanged()) {
            this.setState({unsavedDialog: true});
        } else {
            window.removeEventListener('contextmenu', SmartDialogSettings.onContextMenu, false);
            this.props.onClose && this.props.onClose();
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

    handleToastClose() {
        this.setState({toast: ''});
    }

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

    handleColor(name, value) {
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

    generatePoints() {
        const result = this.props.settings.map((e, i) => {
            const divider = i !== this.props.settings.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null;

            let item;
            if (e.type === 'boolean') {
                item = [(<span key={this.props.dialogKey + '-' + e.name + '-checkbox-name'}>{I18n.t(e.name)}</span>),
                    (<Switch
                        key={this.props.dialogKey + '-' + e.name + '-checkbox'}
                        checked={this.state.values[e.name] || false}
                        onChange={ev => this.handleToggle(e.name, ev)}
                        value={e.name}
                    />)];
            } else if (e.type === 'color') {
                item = (<ColorPicker
                        key={this.props.dialogKey + '-' + e.name + '-color'}
                        name={I18n.t(e.name)}
                        color={this.state.values[e.name] || Theme.tile.tile.background}
                        onChange={color => this.handleColor(e.name, color)}
                    />);
            } else if (e.type === 'icon') {
                /*item = [
                    (<div key={this.props.dialogKey + '-' + e.name + '-icon-label'} style={Theme.settings.label}>{I18n.t(e.name)}</div>),
                    (<div key={this.props.dialogKey + '-' + e.name + '-icon'} style={{width: '100%', textAlign: 'center', height: 64}}>
                        {this.state.values[e.name] ? (<img alt={I18n.t('Item icon')} src={this.state.values[e.name]} style={{width: 64, maxHeight: 64}} />) : <NoIcon width={'100%'} height={'100%'} />}
                    </div>)];*/
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
                return item;
            }
        });
        return [
            (<Toolbar>
                <h4   key={this.props.dialogKey + '-header'} style={Theme.dialog.header}>{this.props.name}</h4>
                <Button onClick={this.onSave.bind(this)}  key={this.props.dialogKey + '-ok'} style={Theme.dialog.saveButton}  disabled={!this.state.changed} variant="extendedFab" color="primary"   aria-label="save"><OkIcon />{I18n.t('Save')}</Button>
            </Toolbar>),
            (<List key={this.props.dialogKey + '-list'} style={Theme.dialog.list}>{result}</List>)
        ];
    }

    onClick() {
        this.click = Date.now();
    }

    render() {
        return (<div key={this.props.dialogKey + '-dialog'} ref={this.refDialog}
                  onClick={this.onClose.bind(this)}
                  style={Theme.dialog.back}>
            <Paper onClick={this.onClick.bind(this)} style={Theme.dialog.inner}>{this.generatePoints()}</Paper>
            <Dialog
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
            </Dialog>
        </div>);
    }
}

export default SmartDialogSettings;