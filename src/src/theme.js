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

export default {
    spacing:        spacing,
    fontFamily:     'Roboto, sans-serif',
    borderRadius:   2,
    lamps: {
        background: blue600
    },
    appBar: {
        //color: 'rgba(200, 200, 200, 0.8)',//''#337ab7',
        //background: 'rgb(39, 144, 222)',
        height: 48
    },
    refreshIndicator: {
        strokeColor: '#337ab7',
        loadingStrokeColor: '#337ab7'
    },
    thumbOff: {
        background: fullWhite
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
            background: 'white',
            opacity: 0.2
        },
        tileIcon: {
            width: '2.5em',
            height: '2.5em',
            position: 'absolute',
            top: '0.9em',
            left: '0.5em',
            color: '#2f3440'
        },
        tileName: {
            overflow: 'hidden',
            width: '100%',
            height: '2.3em'
        },
        tileText: {
            marginTop: '2.8em',
        },
        tileState: {
            marginTop: '0.2em'
        },
        tileStateOn: {
            color: 'grey',
        },
        tileStateOff: {
        }
    }
};