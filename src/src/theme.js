import {
    blue700,
    blue600,
    cyan700,
    grey600,
    grey100, grey400, grey500,
    pinkA100, pinkA200, pinkA400,
    fullWhite,
} from 'material-ui/styles/colors';

import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import Background from './assets/homekit.png';

const appBarHeight = 64;
const tileBorderRadius = '1em';
const tileIconWidth = 40;

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
        minHeight: 'calc(100% - 14px)', // I have no idea, why this 14px are here
        //background: '#000'//'#1b1b1b'
    },
    menu: {
        width: 250,
        selected: {
            color: '#2196f3'
        }

    },
    refreshIndicator: {
        strokeColor: '#337ab7',
        loadingStrokeColor: '#337ab7'
    },
    palette: {
        /*primary1Color:      blue700,
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
        clockCircleColor:   fade(fullWhite, 0.12),*/
        editActive:         'red',
        lampOn:             '#ffcc02'
    },
    iconSize: '24px',
    indicatorSize: '20px',
    slider: {
        background: 'grey'
    },

    tile: {
        tile: {
            margin: '0.3em',
            borderRadius: tileBorderRadius,
            padding: '1em',
            transition: 'all 0.2s',
            width: '8em',
            height: '8em',
            position: 'relative',
            fontSize: '1em',
            fontWeight: 'bold',
            color: 'black',
            background: 'white',
            boxSizing: 'border-box',
            userSelect: 'none'
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
            width: 40, // 2.5em
            height: 40,
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
            marginTop: '0.2em',
            whiteSpace: 'nowrap'
        },
        tileStateOn: {
            color: 'grey',
        },
        tileStateOff: {
        },
        tileIndicators: {
            position: 'absolute',
            top: '1em',
            right: '1em',
            width: 'calc(100% - ' + tileIconWidth + 'px)'
        },
        tileIndicator: {
            width: '1em',
            height: '1em',
            float: 'right'
        },
        tileIndicatorsIcons: {
            working:  '#808080',
            unreach:  'orange',
            lowbat:   'red',
            maintain: 'orange',
            error:    'red',
        },
        editMode: {
            checkIcon: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: 'rgba(200,200,200,0.8)',
                color: 'white',
                borderRadius: '0 ' + tileBorderRadius + ' ' + tileBorderRadius + ' 0'
            },
            editIcon: {
                position: 'absolute',
                top: 0,
                right: '50%',
                width: '50%',
                height: '100%',
                background: 'rgba(200,200,200,0.8)',
                color: 'white',
                borderRadius: tileBorderRadius + ' 0 0 ' + tileBorderRadius
            },
            removeIcon: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(80,80,80,0.8)',
                color: 'gray',
                borderRadius: tileBorderRadius
            },
            editEnabled: {
                background: 'white',
                opacity: 1
            },
            editDisabled: {
                background: 'white',
                opacity: 0.5
            },
        }
    }
};