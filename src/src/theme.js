/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/*import {
    grey,
} from '@mui/material/colors';*/

import Background from './assets/apartment.jpg';

const appBarHeight = 64;
const tileBorderRadius = 16;
const tileSize = 128;

export default {
    typography: {
        useNextVariants: true,
    },
    classes: {
        menuBackground: {
            background: 'inherit'
        },
        loadingBackground: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        loadingContainer: {
            position: 'absolute',
            textAlign: 'center',
            top: 'calc(50% - 40px)'
        },
        loadingText: {
            color: 'rgba(0, 0, 0, .3)',
            fontSize: 24,
            position: 'relative'
        }
    },
    appBar: {
        //color: 'rgba(200, 200, 200, 0.8)',//''#337ab7',
        //background: 'rgb(39, 144, 222)',
        height: appBarHeight
    },
    appBarVersionUpdate: {
        cursor: 'pointer',
        color: 'green'
    },
    appBarIcon: {
        height: 24,
        paddingRight: 10,
        overflow: 'hidden'
    },
    menuIcon: {
        height: 24,
        overflow: 'hidden',
        marginRight: 0,
        width: 24
    },
    mainPanel: {
        // backgroundImage: 'url(' + Background + ')',//'url(homekit.png)',
        backgroundSize: '100% auto',
        paddingTop: appBarHeight,
        minHeight: 'calc(100% - 14px)', // I have no idea, why this 14px are here
    },
    menu: {
        width: 250,
        selected: {
            color: '#2196f3'
        }
    },
    settings: {
        label: {
            fontSize: 16,
            paddingTop: 10
        },
        dropzone: {
            marginTop: 10,
            width: '100%',
            height: 65,
            border: '2px dashed black',
            textAlign: 'center',
            paddingTop: 45,
            borderRadius: 10
        },
        dropzoneRejected: {
            border: '2px dashed red',
        },
        dropzoneAccepted: {
            border: '2px dashed green',
        }
    },
    refreshIndicator: {
        strokeColor: '#337ab7',
        loadingStrokeColor: '#337ab7'
    },
    dialog: {
        inner: {
            height: 'calc(100% - 32px)',
            position: 'absolute',
            top: 16,
            left: 'calc(50% - 180px)',
            maxWidth: 360,
            width: 'calc(100% - 16px)',
            padding: '16px 0 16px 16px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.8)'
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
            height: 'calc(100% - 90px)',
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingBottom: 20,
            width: 'calc(100% - 16px)',
            paddingTop: 15,
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
            color: 'black',
            maxWidth: 'calc(100% - 80px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        saveButton: {
            position: 'absolute',
            top: 10,
            right: 20,
            zIndex: 1

        },
        closeButton: {
            position: 'absolute',
            top: 5,
            right: 5,
            width: 36,
            height: 24,
            borderRadius: 24,
            zIndex: 2
        },
        closeButtonLeft: {
            position: 'absolute',
            top: 5,
            left: 5,
            width: 36,
            height: 24,
            borderRadius: 24,
            zIndex: 2
        },
        settingsBack: {
            background: 'rgba(255,255,255,0.5)'
        },
        info: {
            line: {
                width: '100%'
            },
            label: {
                display: 'inline-block',
                lineHeight: '48px',
                fontSize: 16
            },
            lc: {
                fontSize: 12,
                paddingRight: 16,
                float: 'right',
                lineHeight: '48px'
            },
            icon: {
                height: 20,
                marginRight: 10
            },
            value: {
                fontWeight: 'bold',
                fontSize: 20
            },
            unit: {

            },
            valueUnit: {
                float: 'right',
                lineHeight: '48px'
            },
            floatRight: {
                float: 'right'
            },
            subTitle: {
                color: 'rgba(0, 0, 0, 0.54)',
                padding: 0,
                fontSize: 12,
                lineHeight: 1,
                display: 'block'
            }
        }
    },
    buttonAllLight: {
        height: 24,
        width: 24,
        borderRadius: '50%',
        marginLeft: 10,
        background: 'white',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
    },
    buttonAllBlinds: {
        height: 24,
        width: 24,
        borderRadius: '50%',
        marginLeft: 10,
        background: 'white',
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
    },
    buttonAllIcon: {
        marginLeft: -1,
        marginTop: 1,
    },
    iconAllBlinds: {
        height: 14,
        width: 14,
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
        textColorBright:    'white',
        textColorDark:      'black',
        updateAvailable:    '#3fff3f',
        editActive:         'red',
        lampOn:             '#ffcc02',
        lampOff:            'inherit',
        instanceRunning:    '#52af19',
        instanceStopped:    '#7b3d29',
        browserBar:         '#3f51b5'
    },
    iconSize: '24px',
    indicatorSize: '20px',
    slider: {
        background: 'grey'
    },
    list: {
        title: {
            fontSize: 20,
            color: 'white',
            margin: 8,
            padding: '0 0 0 16px',
        },
        row: {
            paddingLeft: 16,
            paddingRight: 16,
            display: 'inline-block',
            borderRadius: 32,
            border: '1px dashed #c7c7c7',
            margin: 8
        }

    },
    tile: {
        tile: {
            margin: 8,
            borderRadius: tileBorderRadius,
            padding: 16,
            transition: 'all 0.2s',
            width: tileSize,
            height: tileSize,
            position: 'relative',
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
            background: 'white',
            boxSizing: 'border-box',
            userSelect: 'none',
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
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
        tileCornerTouch: {
            borderWidth: '0 28px 28px 0',
        },
        tileOn: {
            background: 'white',
            opacity: 1
        },
        tileOff: {
            background: '#b7b6b6',
            opacity: 0.7
        },
        tileIconSvg: {
            size: 40, // 2.5rem
        },
        tileIcon: {
            width: 40, // 2.5rem
            height: 40,
            position: 'absolute',
            top: 14,
            left: 8,
            color: '#2f3440',
            pointerEvents: 'none'
        },
        tileName: {
            overflow: 'hidden',
            width: '100%',
            height: 37,
        },
        tileName2: {
            overflow: 'hidden',
            float: 'left'
        },
        tileNameSmall: {
            fontSize: 8,
        },
        tileText: {
            pointerEvents: 'none',
            bottom: 0,
            left: 0,
            width: 'calc(100% - 16px)',
            position: 'absolute',
            padding: '0 16px',
            height: 67
        },
        tileText2: {
            height: 32,
            bottom: 0,
            left: 0,
            width: 'calc(100% - 32px)',
            padding: '16px 16px 0 16px',
            pointerEvents: 'none',
            position: 'absolute',
        },
        tileNumber: {
            position: 'absolute',
            bottom: 30,
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
            position: 'absolute',
            bottom: 10,
            left: 16,
            whiteSpace: 'nowrap',
            width: 'calc(100% - 32px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        tileState2: {
            float: 'right',
            whiteSpace: 'nowrap',
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
            top: 16,
            right: 40,
            whiteSpace: 'nowrap',
            //width: 'calc(100% - ' + tileIconWidth + 'px)'
        },
        tileIndicator: {
            width: 16,
            height: 16,
            float: 'right',
            display: 'inline-block'
        },
        tileIndicatorsIcons: {
            working:   '#808080',
            unreach:   'orange',
            lowbat:    '#6b0000b5',
            maintain:  'orange',
            error:     'red',
            direction: 'green',
            connected: 'red'
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
                top: 32,
                right: 16
            },
            button: {
                position: 'absolute',
                top: 16,
                right: 8
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
                borderRadius: '0 ' + tileBorderRadius + ' ' + tileBorderRadius + ' 0',
                zIndex: 3,
                cursor: 'pointer'
            },
            editIcon: {
                position: 'absolute',
                top: 0,
                right: '50%',
                width: '50%',
                height: '100%',
                background: 'rgba(200,200,200,0.8)',
                color: 'white',
                borderRadius: tileBorderRadius + ' 0 0 ' + tileBorderRadius,
                zIndex: 3,
                cursor: 'pointer'
            },
            removeIcon: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(80,80,80,0.8)',
                color: 'gray',
                borderRadius: tileBorderRadius,
                zIndex: 3
            },
            buttonIcon: {
                paddingTop: tileSize / 2
            },
            buttonIconRemoved: {
                paddingTop: tileSize / 4
            },
            editEnabled: {
                backgroundColor: 'white',
                opacity: 1
            },
            editDisabled: {
                backgroundColor: 'white',
                opacity: 0.5
            },
        }
    }
};
