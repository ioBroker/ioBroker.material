import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Checkbox, DialogTitle, FormControl, FormControlLabel, InputLabel, makeStyles, MenuItem, Paper, Select, TextField, ThemeProvider } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import IconClose from '@material-ui/icons/Close';
import IconCheck from '@material-ui/icons/Check';

import I18n from '@iobroker/adapter-react/i18n';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import ObjectChart from '../States/components/ObjectChart';

let node = null;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: 'auto',
        display: 'flex'
    },
    paper: {
        // maxWidth: 960,
        width: 'calc(100% - 64px)'
    },
    overflowHidden: {
        display: 'flex',
        flexDirection: 'column',
        border: 'none'
        // overflow: 'hidden'
    },
    pre: {
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        margin: 0
    },
    showDialog: {
        marginTop: 10
    },
    nameField: {
        marginTop: 10
    },
    roleField: {
        marginTop: 10

    },
    typeField: {
        marginTop: 10

    },
    unitField: {
        // marginTop: 10

    },
    minField: {
        marginTop: 10,
        marginRight: 10

    },
    maxField: {
        marginTop: 10

    },
    minMax: {
        display: 'flex'
    }
}));

const typeArray = [
    'string',
    'boolean',
    'number',
    'file',
];

const DialogChart = ({ cb, id, socket, channelId, arrayStateDefault, themeType }) => {
    console.log(11223344, 'test', id)
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [object, setObject] = useState(null);

    // const [role, setRole] = useState(null);
    // const [roleInput, setRoleInput] = useState(null);
    // const [roles, setRoles] = useState([]);
    // const [name, setName] = useState('NEW_STATE');
    // const [unit, setUnit] = useState('');
    // const [type, setType] = useState('string');
    // const [checkedRead, setCheckedRead] = useState(true);
    // const [checkedWrite, setCheckedWrite] = useState(true);
    // const [min, setMin] = useState(0);
    // const [max, setMax] = useState(100);

    useEffect(async () => {
        const obj = await socket.getObject(id);
        console.log(11223344, obj)
        setObject(obj);
    }, [])

    const onClose = () => {
        cb()
        setOpen(false);
        if (node) {
            document.body.removeChild(node);
            node = null;
        }
    };

    return <ThemeProvider theme={theme(Utils.getThemeName())}>
        <Dialog
            maxWidth="lg"
            fullWidth
            onClose={onClose}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <DialogTitle>{I18n.t('Add state %s', `sssss`)}</DialogTitle>
            <DialogContent className={classes.overflowHidden} dividers>
                <Paper className={classes.showDialog} style={{ padding: `10px 20px`, width: '100%', height: 600 }} p={3}>
                    {object && <ObjectChart
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        socket={socket}
                        obj={object}
                        themeType={themeType}
                        from={Date.now() - 3600000 * 2}
                        end={Date.now()}
                        // noToolbar
                        // //dateFormat={"dddd, mmmm dS, yyyy, h:MM:ss TT"}
                        defaultHistory="history.0"
                        historyInstance="history.0"
                    />}
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    autoFocus
                    // disabled={!name || objects[`${channelId}.${name}`] || arrayStateDefault.find(item => item.name === name)}
                    onClick={async () => {
                        onClose();
                        // let obj = {
                        //     _id: `${channelId}.${name}`,
                        //     common: {
                        //         name,
                        //         role: roleInput,
                        //         type,
                        //     },
                        //     type: 'state'
                        // };
                        // if (type === 'number') {
                        //     obj.common.min = min;
                        //     obj.common.max = max;
                        //     obj.common.unit = unit;

                        // }
                        // if (type !== 'file') {
                        //     obj.common.read = checkedRead;
                        //     obj.common.write = checkedWrite;
                        // }
                        // await socket.setObject(`${channelId}.${name}`, obj);
                        // cb(obj);
                    }}
                    startIcon={<IconCheck />}
                    color="primary">
                    {I18n.t('Add')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onClose()}
                    startIcon={<IconClose />}
                    color="default">
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

export const dialogChartCallBack = (cb, id, socket, themeType) => {
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
    }

    return ReactDOM.render(
        <DialogChart
            cb={cb}
            themeType={themeType}
            id={id} socket={socket}
        />, node);
}