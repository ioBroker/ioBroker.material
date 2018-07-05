import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 300,
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    image: {
        position: 'relative',
        height: 200,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
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
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${theme.spacing.unit + 6}px`,
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
        return (
            <div className={this.classes.root} style={this.props.maxHeight ? {maxHeight: this.props.maxHeight} : {}}>
                {this.props.images.map(function(image, i) {
                    let Image;

                    if (typeof image === 'object') {
                        Image = image.icon;
                    }
                    return (
                        <ButtonBase
                            onClick={() => this.onSelect(image, i)}
                            focusRipple
                            key={'images-' + i}
                            className={this.classes.image}
                            focusVisibleClassName={this.classes.focusVisible}
                            style={{width: '20%', height: 64, background: 'grey', marginRight: 2, marginBottom: 2}}
                        >
                            {Image ?
                                (<Image className={this.classes.imageSrc} width={'calc(100% - 10px)'} height={'calc(100% - 10px)'}/>) :
                                (<span className={this.classes.imageSrc} style={{backgroundImage: `url(${image})`,}}/>)
                            }
                            <span className={this.classes.imageBackdrop} />
                            <span className={this.classes.imageButton}>
                        </span>
                        </ButtonBase>
                    );
                }.bind(this))}
            </div>
        );
    }

}

ImageList.propTypes = {
    classes:    PropTypes.object.isRequired,
    images:     PropTypes.array.isRequired,
    onSelect:   PropTypes.func.isRequired
};

export default withStyles(styles)(ImageList);