import React, {Component} from 'react';
import Theme from '../theme';
import IconUp from 'react-icons/lib/fa/angle-double-up';
import IconDown from 'react-icons/lib/fa/angle-double-down';
import IconLamp from 'react-icons/lib/ti/lightbulb';
import IconStop from 'react-icons/lib/md/stop'
import I18n from '../i18n';
import {darken} from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

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
        const result = this.props.points.map(e =>
            (<li><span>{e.name}:</span><span>{this.props.states[e.id] ? this.props.states[e.id].val : '?'}</span><span>{e.unit}</span></li>)
        );


        return (<ul>{result}</ul>);
    }

    render() {
        return (<div ref={this.refDialog}
             onClick={this.onClose.bind(this)}
             style={{width: '100%', height: '100%', zIndex: 2100, userSelect: 'none', position: 'fixed', top: 0, left: 0, background: 'rgba(255,255,255,0.8'}}>
            {this.generatePoints()}
        </div>);
    }
}

export default SmartDialogInfo;