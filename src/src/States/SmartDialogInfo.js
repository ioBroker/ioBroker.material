import React from 'react';
import PropTypes from 'prop-types';
import Theme from '../theme';
import I18n from '../i18n';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Moment from 'react-moment';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';
import SmartDialogGeneric from './SmartDialogGeneric';
import Typography from '@material-ui/core/Typography';
import BoolControl from '../basic-controls/react-info-controls/BoolControl'
import InputControl from '../basic-controls/react-info-controls/InputControl'

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

class SmartDialogInfo extends SmartDialogGeneric  {
    // expected:
    static propTypes = {
        name:               PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        dialogKey:          PropTypes.string.isRequired,
        windowWidth:        PropTypes.number,
        onClose:            PropTypes.func.isRequired,
        objects:            PropTypes.object,
        states:             PropTypes.object,
        onValueChange:      PropTypes.func,
        points:             PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);
        this.props.points.forEach(e => {
            this.stateRx[e.id] = this.props.states[e.id] ? this.props.states[e.id].val : null;
        });
        this.refDialog = React.createRef();

        this.componentReady();
    }

    controlValue(id, value) {
        this.setState({toast: I18n.t('sent')});
        this.props.onValueChange && this.props.onValueChange(id, value);
    }

    handleToggle(id) {
        const newState = {};
        newState[id] = !this.state[id];
        this.setState(newState);
        this.controlValue(id, newState[id]);
    }

    handleValue(id, value) {
        const newState = {};
        newState[id] = value;
        if (this.state[id] !== newState[id]) {
            this.setState(newState);
        }
        this.controlValue(id, value);
    }

    generateContent() {
        const result = this.props.points.map((e, i) => {
            const Icon = e.icon;
            const divider = i !== this.props.points.length - 1 ? (<ListItem key={e.id + '_div'} style={Theme.dialog.divider}/>) : null;

            let item;

            if (e.common && e.common.write) {
                if (e.common.type === 'boolean') {
                    // switch
                    if (e.common.read !== false) {
                        item = (<BoolControl
                                    key={this.props.dialogKey + '-' + e.id + '-control'}
                                    label={e.name}
                                    value={this.state[e.id]}
                                    language={I18n.getLanguage()}
                                    icon={e.icon}
                                    ts={0}
                                    onChange={() => this.handleToggle(e.id)}
                                    />);
                    } else { // button: read = false, write = true
                        item = (<div key={this.props.dialogKey + '-' + e.id + '-control'}
                                     style={{width: '100%', textAlign: 'center'}}>
                                    <Button variant="contained" style={{minWidth: '50%'}} onClick={event => this.handleButton(event, e.id)}>{e.name}</Button>
                                </div>);
                    }
                } else if (e.common.type === 'number' && e.common.min !== undefined && e.common.max !== undefined) {
                    // slider
                    item = [(<Typography key={this.props.dialogKey + '-' + e.id + '-title'}>{e.name} - {this.state[e.id]}{e.unit}</Typography>),
                        (<Slider
                            key={this.props.dialogKey + '-' + e.id + '-control'}
                            min={e.common.min}
                            max={e.common.max}
                            step={((e.common.max - e.common.min) / 100)}
                            value={this.state[e.id]}
                            aria-labelledby={e.name}
                            style={{width: 'calc(100% - 20px)', marginLeft: 10}}
                            onChange={(event, value) => this.handleValue(e.id, value)}
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
                    item = (<InputControl
                        key={this.props.dialogKey + '-' + e.id + '-title'}
                        type={e.common && e.common.type === 'number' ? 'number' : 'text'}
                        icon={e.icon}
                        label={e.name}
                        value={this.state[e.id]}
                        onChange={value => this.handleValue(e.id, value)}
                    />);
                }
            } else {
                const state = this.props.states[e.id];
                if (e.common && e.common.type === 'boolean') {
                    item = (<BoolControl
                        key={this.props.dialogKey + '-' + e.id + '-control'}
                        label={e.name}
                        value={this.state[e.id]}
                        language={I18n.getLanguage()}
                        ts={(this.props.states[e.id] && this.props.states[e.id].lc) || 0}
                    />);
                } else {
                    item = (
                        <ListItem key={this.props.dialogKey + '-' + e.id + '-title'} style={Theme.dialog.point}>
                            {false && Icon ? (<ListItemIcon><Icon /></ListItemIcon>) : null}
                            <ListItemText primary={e.name} secondary={state && state.ts ? (<Moment style={{fontSize: 12}} date={state.ts} interval={15} fromNow locale={I18n.getLanguage()}/>) : '?'} />
                            <ListItemSecondaryAction>
                                <span style={Theme.dialog.value}>{state && state.val !== undefined && state.val !== null ? state.val.toString() : '?'}</span>
                                <span style={Theme.dialog.unit}>{e.unit}</span>
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                }
            }

            if (divider) {
                return [item, divider];
            } else {
                return item;
            }
        });
        return [
            (<h4   key={this.props.points[0].id + '_info_header'} style={Theme.dialog.header}>{this.props.name}</h4>),
            (<List key={this.props.points[0].id + '_info_list'}   style={Theme.dialog.list}>{result}</List>)
        ];
    }
}

export default SmartDialogInfo;