import {
    grey,
} from '@material-ui/core/colors';

import Background from './assets/homekit.png';

const appBarHeight = 64;
const tileBorderRadius = '1em';
const tileIconWidth = 40;

export default {
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
    dialog: {
        inner: {
            height: 'calc(100% - 2em)',
            position: 'absolute',
            top: '1em',
            left: 'calc(50% - 180px)',
            maxWidth: 360,
            width: '100%',
            background: '#cacaca',
            borderRadius: '1em',
            padding: '1em',
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
            overflowX: 'hidden',
            overflowY: 'auto',
            boxSizing: 'border-box'
        },
        back:  {
            width: '100%',
            height: '100%',
            zIndex: 2100,
            userSelect: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            background: 'rgba(238,238,238,0.8)'
        },
        list:{

        },
        point: {
        },
        name: {

        },
        value: {
            fontWeight: 'bold'
        },
        unit: {

        },
        divider: {
            paddingTop: 0,
            paddingBottom: 0,
            height: 1,
            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 13%,rgba(255,255,255,1) 83%,rgba(255,255,255,0) 100%)'
        },
        header: {
            fontSize: 20,
            textAlign: 'center',
            color: 'white'
        }
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
    list: {
        title: {
            //background: 'rgba(210, 210, 210, 0.8)',
            fontSize: 20,
            color: 'white',
            margin: '0.5em',
            padding: '0 0 0 1em',
            //padding: '0.5em 0 0.5em 2em',
            //borderRadius: '0.5em'
        },
        row: {
            //width: 'calc(100% - 4em)',
            paddingLeft: '1em',
            paddingRight: '1em',
            display: 'inline-block',
            //background: '#ffffff57', // experimental
            borderRadius: '2em',
            border: '1px dashed #c7c7c7',
            margin: '0.5em'
        }

    },
    tile: {
        tile: {
            margin: '0.5em',
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
            userSelect: 'none',
            display: 'inline-block',
            overflow: 'hidden',
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px'
        },
        tileCorner: {
            position: 'absolute',
            top: 0,
            right: 0,
            borderWidth: '0 16px 16px 0',
            borderStyle: 'solid',
            borderColor: 'rgba(173, 173, 173, 1) rgba(173, 173, 173, 1) rgb(212, 212, 212) rgb(193, 193, 193)',
            background: 'rgba(173, 173, 173, 1)',
            boxShadow: '0 1px 1px rgba(0,0,0,0.3), -1px 1px 1px rgba(0,0,0,0.2)',
            borderRadius: '0 0 0 10px',
            transition: 'border-width 0.1s ease-in-out',
            cursor: 'pointer',
            zIndex: 2
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
        tileNameSmall: {
            fontSize: 8,
        },
        tileText: {
            marginTop: '2.8em',
            pointerEvents: 'none',
            position: 'relative'
        },
        tileNumber: {
            position: 'absolute',
            bottom: 10,
            right: 10,
            borderRadius: 20,
            background: 'rgb(45, 116, 249)',
            opacity: 0.6,
            minWidth: 20,
            height: 19,
            paddingTop: 1,
            color: 'white',
            textAlign: 'center'
        },
        tileState: {
            marginTop: '0.2em',
            whiteSpace: 'nowrap',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        tileStateOn: {
            color: '#515151',
            fontSize: 14
        },
        tileStateOff: {
            color: '#515151',
            fontSize: 14
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
            working:   '#808080',
            unreach:   'orange',
            lowbat:    'red',
            maintain:  'orange',
            error:     'red',
            direction: 'green'
        },
        secondary: {
            icon: {
                display: 'inline-block',
                width: 12,
                height: 12
            },
            text: {
                display: 'inline-block',
                fontSize: 14,
                paddingLeft: 3
            },
            div: {
                position: 'absolute',
                top: '2em',
                right: '1em'
            }
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