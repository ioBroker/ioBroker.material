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
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import ButtonBase from '@mui/material/ButtonBase';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 300,
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        marginLeft: 22
    },
    image: {
        position: 'relative',
        height: 200,
        /*[theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },*/
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    focusVisible: {},
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSrc: {
        position: 'absolute',
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        color: 'white'
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)} ${theme.spacing(4)} ${theme.spacing(6)}`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
});

class ImageList extends React.Component {
    constructor(props) {
        super(props);
        this.classes = props.classes;
    }
    onSelect(image, i) {
        this.props.onSelect && this.props.onSelect(image);
    }

    render() {
        return <div className={this.classes.root} style={this.props.maxHeight ? {maxHeight: this.props.maxHeight} : {}}>
            {this.props.images.map((image, i) => {
                let Image;

                if (typeof image === 'object') {
                    Image = image.icon;
                }

                return <ButtonBase
                    tabIndex={i}
                    onClick={() => this.onSelect(image, i)}
                    focusRipple
                    key={'images-' + i}
                    className={this.classes.image}
                    focusVisibleClassName={this.classes.focusVisible}
                    style={{width: 64, height: 64, background: 'grey', marginRight: 2, marginBottom: 2}}
                >
                    {Image ?
                        <Image className={this.classes.imageSrc} width={'calc(100% - 10px)'} height={'calc(100% - 10px)'}/> :
                        <span className={this.classes.imageSrc} style={{backgroundImage: `url(${image})`}}/>
                    }
                    <span className={this.classes.imageBackdrop} />
                    <span className={this.classes.imageButton}/>
                </ButtonBase>;
            })}
        </div>;
    }

}

ImageList.propTypes = {
    classes:    PropTypes.object.isRequired,
    images:     PropTypes.array.isRequired,
    onSelect:   PropTypes.func.isRequired
};

export default withStyles(styles)(ImageList);
