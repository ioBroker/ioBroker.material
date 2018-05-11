import {
    blue700,blue600,
    cyan700,
    grey600,
    grey100, grey400, grey500,
    pinkA100, pinkA200, pinkA400,
    fullWhite,
} from 'material-ui/styles/colors';

import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import Background from './assets/homekit.png';

const appBarHeight = 48;

export default {
    spacing:        spacing,

    appBar: {
        //color: 'rgba(200, 200, 200, 0.8)',//''#337ab7',
        //background: 'rgb(39, 144, 222)',
        height: appBarHeight
    },
    mainPanel: {
        backgroundImage: 'url(' + Background + ')',//'url(homekit.png)',
        backgroundSize: '100% auto',
        paddingTop: appBarHeight,
        minHeight: '100%',
        //background: '#000'//'#1b1b1b'
    },
    menu: {
        width: '250px'
    },
    refreshIndicator: {
        strokeColor: '#337ab7',
        loadingStrokeColor: '#337ab7'
    },
    palette: {
        primary1Color:      blue700,
        primary2Color:      blue600,
        primary3Color:      grey600,
        accent1Color:       grey500,
        accent2Color:       grey400,
        accent3Color:       grey100,
        textColor:          fullWhite,
        secondaryTextColor: fade(fullWhite, 0.7),
        alternateTextColor: '#303030',
        canvasColor:        '#303030',
        borderColor:        fade(fullWhite, 0.3),
        disabledColor:      fade(fullWhite, 0.3),
        pickerHeaderColor:  fade(fullWhite, 0.12),
        clockCircleColor:   fade(fullWhite, 0.12),
        lampOn:             '#ffcc02'
    },
    iconSize: '24px',
    indicatorSize: '20px',


    tile: {
        tile: {
            margin: '0.3em',
            borderRadius: '1em',
            padding: '1em',
            transition: 'all 0.2s',
            width: '8em',
            height: '8em',
            position: 'relative',
            fontSize: '1em',
            fontWeight: 'bold',
            color: 'black',
            background: 'white'
        },
        tileOn: {
            background: 'white',
            opacity: 1
        },
        tileOff: {
            background: '#b7b6b6',
            opacity: 0.7
        },
        tileIcon: {
            width: '2.5em',
            height: '2.5em',
            position: 'absolute',
            top: '0.9em',
            left: '0.5em',
            color: '#2f3440',
            pointerEvents: 'none'
        },
        tileName: {
            overflow: 'hidden',
            width: '100%',
            height: '2.3em',
        },
        tileText: {
            marginTop: '2.8em',
            pointerEvents: 'none'
        },
        tileState: {
            marginTop: '0.2em'
        },
        tileStateOn: {
            color: 'grey',
        },
        tileStateOff: {
        }
    },
    dimmer: {
        outter: {
            width: 'calc(100% - 2em)',
            height: 'calc(100% - 2em)',
            border: '1px solid gray',
            borderRadius: '10px',
            position: 'absolute',
            overflow: 'hidden'
        },
        innerVer: {
            width: '100%',
            background: '#ffcc02',
            position: 'absolute',
            bottom: 0,
            left: '0.5px',
            borderRradius: '0 0 10px 10px'
        },
        innerHor: {
            height: '100%',
            background: '#ffcc02',
            position: 'absolute',
            top: 0,
            left: 0
        },
        value: {
            position: 'absolute',
            top: 'calc(50% - 10px)',
            left: '0',
            width: '100%',
            textAlign: 'center'
        }
    }
};