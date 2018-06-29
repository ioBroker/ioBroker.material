import React, {Component} from 'react';
import Theme from '../theme';
import I18n from '../i18n';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Moment from 'react-moment';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Slider from 'material-ui-slider-label/Slider';

const styles = {
    labelStyleOuter: {
        width: '30px',
        height: '30px',
        borderRadius: '50% 50% 50% 0',
        background: 'grey',
        position: 'absolute',
        transform: 'rotate(-45deg)',
        top: '-40px',
        left: '-9px',
    },
    labelStyleInner: {
        transform: 'rotate(45deg)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        top: '3px',
        right: '0px',
        fontSize: '10px',
    },
};

class SmartDialogInfo extends Component  {

    // expected:
    // points - array of [{id, icon, unit, name, iconStyle}]
    // onValueChange
    // onClose
    // objects
    // states
    constructor(props) {
        super(props);
        this.state = {
            toast: ''
        };
        this.props.points.forEach(e => {
             this.state[e.id] = this.props.states[e.id] ? this.props.states[e.id].val : null;
        });
        // disable context menu after long click
        window.addEventListener('contextmenu', SmartDialogInfo.onContextMenu, false);

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
        window.removeEventListener('contextmenu', SmartDialogInfo.onContextMenu, false);
        this.props.onClose && this.props.onClose();
    }

    handleToastClose() {
        this.setState({toast: ''});
    }

    handleInputSet(id) {
        console.log('handleInputSet', id);
    }

    handleToggle(id) {
        console.log('handleToggle', id);
    }

    handleButton(id) {
        console.log('handleButton', id);
    }

    handleSlider(id, value) {
        console.log('handleSlider', id, value);
    }

    generatePoints() {
        const result = this.props.points.map((e, i) => {
            const Icon = e.icon;
            const state = this.props.states[e.id];
            const divider = i !== this.props.points.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null;

            let item;

            if (e.common && e.common.write) {
                if (e.common.type === 'boolean') {
                    // switch
                    if (e.common.read !== false) {
                        item = [(<span>{e.name}</span>),
                            (<Switch
                                checked={this.state[e.id]}
                                onChange={() => this.handleToggle(e.id)}
                                value={e.id}
                            />)];
                    } else { // button: read = false, write = true
                        item = (<Button variant="contained" click={() => this.handleButton(e.id)}>{e.name}</Button>);
                    }
                } else if (e.common.type === 'number' && e.common.min !== undefined && e.common.max !== undefined) {
                    // slider
                    item = [(<div>{e.name} {e.unit}</div>),
                        (<Slider
                            defaultValue={e.common.min}
                            min={e.common.min}
                            max={e.common.max}
                            step={((e.common.max - e.common.min) / 100)}
                            value={this.state[e.id]}
                            onChange={(e, value) => this.handleSlider(e.id, value)}
                            label={
                                <div style={styles.labelStyleOuter}>
                                    <div style={styles.labelStyleInner}>
                                        {this.state[e.id]}
                                    </div>
                                </div>
                            }
                        />)];
                } else {
                    // input field
                    item = [(<TextField
                            key={e.id + '_input'}
                            id={e.id}
                            label={e.name}
                            value={state ? state.val : ''}
                            onChange={this.handleChange('name')}
                            margin="normal"
                        />),
                        (<Button key={e.id + '_set'} click={() => this.handleInputSet(e.id)} variant="contained">{e.name}</Button>)];
                }
            } else {
                item = (<ListItem key={e.id + '_info'} style={Theme.dialog.point}>
                    {false && Icon ? (<ListItemIcon><Icon /></ListItemIcon>) : null}
                    <ListItemText primary={e.name} secondary={state && state.ts ? (<Moment style={{fontSize: 12}} date={state.ts} interval={15} fromNow locale={I18n.getLanguage()}/>) : '?'} />
                    <ListItemSecondaryAction>
                        <span style={Theme.dialog.value}>{state ? state.val : '?'}</span>
                        <span style={Theme.dialog.unit}>{e.unit}</span>
                    </ListItemSecondaryAction>
                </ListItem>);
            }

            if (divider) {
                return [item, divider];
            } else {
                return item;
            }
        });
        return [
            (<h4   key={this.props.points[0].id + '_header'} style={Theme.dialog.header}>{this.props.name}</h4>),
            (<List key={this.props.points[0].id + '_list'} style={Theme.dialog.list}>{result}</List>)
        ];
    }

    render() {
        return (<div key={this.props.points[0].id + '_dialog'} ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={Theme.dialog.back}>
            <div style={Theme.dialog.inner}>{this.generatePoints()}</div>
        </div>);
    }
}

export default SmartDialogInfo;