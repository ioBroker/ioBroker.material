import React, {Component} from 'react';
import Theme from '../theme';
import I18n from '../i18n';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Moment from 'react-moment';

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

    generatePoints() {
        const result = this.props.points.map((e, i) => {
            const Icon = e.icon;
            const state = this.props.states[e.id];
            return [(<ListItem key={e.id + '_info'} style={Theme.dialog.point}>
                {false && Icon ? (<ListItemIcon><Icon /></ListItemIcon>) : null}
                <ListItemText primary={e.name} secondary={state && state.ts ? (<Moment style={{fontSize: 12}} date={state.ts} interval={15} fromNow locale={I18n.getLanguage()}/>) : '?'} />
                <ListItemSecondaryAction>
                    <span style={Theme.dialog.value}>{state ? state.val : '?'}</span>
                    <span style={Theme.dialog.unit}>{e.unit}</span>
                </ListItemSecondaryAction>
            </ListItem>),
                i !== this.props.points.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null
            ];
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