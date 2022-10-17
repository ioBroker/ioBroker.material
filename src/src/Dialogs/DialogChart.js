import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { makeStyles } from '@mui/styles';
import { ThemeProvider } from '@mui/material/styles';
import cls from './style.module.scss';

import { MdClose as CloseIcon } from 'react-icons/md';

import I18n from '@iobroker/adapter-react-v5/i18n';
import theme from '@iobroker/adapter-react-v5/Theme';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import ObjectChart from '../States/components/ObjectChart';
import CustomFab from '../States/components/CustomFab';
import clsx from 'clsx/dist/clsx';

let node = null;

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette?.background?.paper,
        width: '100%',
        height: 'auto',
        display: 'flex'
    },
    paper: {
        height: '100%'
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
        // marginTop: 10,
        width: '100%',
        height: '100%',
        display: 'flex',
        marginTop: 0
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

const DialogChart = ({ cb, id, socket, themeType, systemConfig, allObjects, ids }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [arrayObjects, setArrayObjects] = useState([]);

    useEffect(() => {
        // document.getElementById('root').className = `blurDialogOpen`;
    }, []);

    useEffect(() => {
        if (ids.length) {
            let newArray = ids.map(idUri => allObjects[idUri]);
            setArrayObjects(newArray);
        }
    }, [ids]);

    const onClose = () => {
        cb()
        setOpen(false);
        // document.getElementById('root').className = ``;
        if (node) {
            document.body.removeChild(node);
            node = null;
        }
    };

    return <ThemeProvider theme={theme(Utils.getThemeName())}>
        <Dialog
            maxWidth="lg"
            fullWidth
            // fullScreen
            classes={{
                paper: clsx(cls.backgroundDialog, classes.paper, cls.chartPaper),
                root: cls.rootDialog
            }}
            BackdropProps={{
                classes: {
                    root: cls.filterBlur,
                },
            }}
            onClose={onClose}
            open={open}
        >
            {/* <DialogTitle>{I18n.t('Add state %s', `sssss`)}</DialogTitle> */}
            <DialogContent
                className={clsx(cls.dialogContent,cls.dialogContentChart)}
                classes={{
                    root: cls.overflowHidden,
                }}
                // className={classes.overflowHidden}
                dividers>
                <div className={classes.showDialog}>
                    {allObjects[id] && <ObjectChart
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        socket={socket}
                        obj={allObjects[id]}
                        objs={arrayObjects}
                        themeType={themeType}
                        from={Date.now() - 3600000 * 2}
                        end={Date.now()}
                        // noToolbar
                        // //dateFormat={"dddd, mmmm dS, yyyy, h:MM:ss TT"}
                        defaultHistory={systemConfig?.common?.defaultHistory || 'history.0'}
                        historyInstance={systemConfig?.common?.defaultHistory || 'history.0'}
                    />}
                </div>
            </DialogContent>
            <DialogActions className={cls.dialogActions}>
                <CustomFab onClick={() => onClose()} size="small" autoFocus>
                    <CloseIcon />{/*I18n.t('Close')*/}
                </CustomFab>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

export const dialogChartCallBack = (cb, id, socket, themeType, systemConfig, allObjects, ids) => {
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
        node._root = createRoot(node);
    }

    return node._root.render(
        <DialogChart
            cb={cb}
            themeType={themeType}
            id={id}
            socket={socket}
            systemConfig={systemConfig}
            allObjects={allObjects}
            ids={ids}
        />);
}