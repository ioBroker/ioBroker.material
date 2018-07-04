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
import ImageUploader from 'react-images-upload';

import OkIcon from 'react-icons/lib/md/save';
import CancelIcon from 'react-icons/lib/md/cancel'
class SmartDialogSettings extends Component  {

    // expected:
    //      name
    //      dialogKey
    //      settings - array of [{id, icon, color, ...}]
    //      onSave
    //      onClose

    constructor(props) {
        super(props);
        const state = {
            __toast: '',
            __changed: false,
            __unsavedDialog: false
        };
        this.props.settings.forEach(e => {
            state[e.name] = e.value === '__default__' ? '' : e.value;
        });

        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogSettings.onContextMenu, false);

        this.state = state;
        this.refDialog = React.createRef();
    }

    static onContextMenu(e) {
        e.preventDefault();
        console.log('Ignore context menu' + e);
        return false;
    }

    componentDidMount() {
        // move this element to the top of body
        this.savedParent = this.refDialog.current.parentElement;
        document.body.appendChild(this.refDialog.current);
    }

    componentWillUnmount() {
        this.savedParent.appendChild(this.refDialog.current);
    }

    onClose() {
        const now = Date.now();
        if (this.click && now - this.click < 50) {
            return;
        }
        if (!this.ignoreUnsaved && this.isChanged()) {
            this.setState({__unsavedDialog: true});
        } else {
            window.removeEventListener('contextmenu', SmartDialogSettings.onContextMenu, false);
            this.props.onClose && this.props.onClose();
        }
    }

    onSave() {
        const settings = {};
        this.props.settings.forEach(item => {
            settings[item.name] = this.state[item.name];
        });

        this.props.onSave(settings);
        this.ignoreUnsaved = true;
        this.onClose();
    }

    handleWarningCancel = () => {
        this.ignoreUnsaved = false;
        this.click = Date.now();
        this.setState({__unsavedDialog: false});
    };

    handleWarningIgnore = () => {
        this.ignoreUnsaved = true;
        this.setState({__unsavedDialog: false});
        this.click = 0;
        this.onClose();
    };

    handleToastClose() {
        this.setState({__toast: ''});
    }

    handleText(name, ev) {
        console.log('handleInputSet', name, ev.target.value);
        this.click = Date.now();
        const newValue = {};
        newValue[name] = ev.target.value;
        newValue.__changed = this.isChanged(name, newValue[name]);
        this.setState(newValue);
    }

    handleToggle(name, ev) {
        const newValue = {};
        this.click = Date.now();
        newValue[name] = ev.target.checked;
        newValue.__changed = this.isChanged(name, newValue[name]);
        this.setState(newValue);
    }

    handleColor(name, value) {
        const newValue = {};
        this.click = Date.now();
        newValue[name] = value;
        newValue.__changed = this.isChanged(name, newValue[name]);
        this.setState(newValue);
    }

    isChanged(name, newVal) {
        return !!this.props.settings.find(item => {
            if (item.name === name) {
                return newVal !== item.value;
            } else {
                return item.value !== this.state[item.name]
            }
        });
    }

    onDropHandler(name, picture) {
        this.setState({
            [name]: picture,
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
                        checked={this.state[e.name] || false}
                        onChange={ev => this.handleToggle(e.name, ev)}
                        value={e.name}
                    />)];
            } else if (e.type === 'color') {
                item = (<ColorPicker
                        name={I18n.t(e.name)}
                        color={this.state[e.name] || Theme.tile.tile.background}
                        onChange={color => this.handleColor(e.name, color)}
                    />);
            } else if (e.type === 'icon') {
                item = (<div style={{width: '100%', textAlign: 'center'}}> <img src={this.state[e.name]} style={{width: 64, maxHeight: 64}} /></div>);
            } else if (e.type === 'image') {
                item = (<ImageUploader
                        withIcon={true}
                        buttonText='Choose images'
                        onChange={this.onDropHandler.bind(this)}
                        imgExtension={['.jpg', '.gif', '.png', '.gif']}
                        maxFileSize={5242880}
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
                    value={this.state[e.name] || ''}
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
                    value={this.state[e.name] || ''}
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
            (<h4   key={this.props.dialogKey + '-header'} style={Theme.dialog.header}>{this.props.name}</h4>),
            (<Button onClick={this.onSave.bind(this)}  key={this.props.dialogKey + '-ok'}   style={{marginRight: '1em'}}  disabled={!this.state.__changed} variant="extendedFab" color="primary"   aria-label="save"><OkIcon />{I18n.t('Save')}</Button>),
            (<Button onClick={this.onClose.bind(this)} key={this.props.dialogKey + '-cancel'} style={{float: 'right'}} variant="extendedFab" aria-label="cancel"><CancelIcon/></Button>),
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
            <div onClick={this.onClick.bind(this)} style={Theme.dialog.inner}>{this.generatePoints()}</div>
            <Dialog
                style={{zIndex: 2101}}
                open={this.state.__unsavedDialog}
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