import { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

import { Menu, MenuItem, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import CropIcon from '@mui/icons-material/Crop';

import IconPicker from '@iobroker/adapter-react-v5/Components/IconPicker';

const styles = () => ({
    image: {
        objectFit: 'contain',
        margin: 'auto',
        display: 'flex',
        width: '100%',
        height: '100%',
    },

    buttonCropWrapper: {
        position: 'absolute',
        zIndex: 222,
        right: 0,
        top: 50
    },
    buttonIconsWrapper: {
        position: 'absolute',
        zIndex: 222,
        right: 0,
        top: 100
    },
    error: {
        border: '2px solid red'
    },
    iconPickerLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});

class UploadImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            cropHandler: false,
        };
        this.cropperRef = createRef();
    }

    render() {
        const { disabled, classes, icon, t, crop, onChange, className } = this.props;
        const { anchorEl, cropHandler } = this.state;
        return <div className={className} style={{position: 'relative'}}>
            {icon && crop && <div className={classes.buttonCropWrapper}>
                <Tooltip title={t('Crop')}>
                    <IconButton onClick={e => {
                        if (!cropHandler) {
                            this.setState({ cropHandler: true });
                        } else {
                            this.setState({ anchorEl: e.currentTarget });
                        }
                        e.stopPropagation();
                    }}>
                        <CropIcon color={cropHandler ? 'primary' : 'inherit'} />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={!!anchorEl}
                    onClose={() => this.setState({ anchorEl: null })}
                >
                    <MenuItem onClick={() => this.setState({ anchorEl: null, cropHandler: false }, () => {
                        const imageElement = this.cropperRef?.current?.cropper;
                        onChange(imageElement.getCroppedCanvas().toDataURL());
                    })}>{t('Save')}</MenuItem>
                    <MenuItem onClick={() => this.setState({ anchorEl: null, cropHandler: false })}>{t('Close')}</MenuItem>
                </Menu>
            </div>}

            <IconPicker
                label={this.props.t('Icon')}
                disabled={disabled}
                customClasses={{label: classes.iconPickerLabel}}
                onChange={base64 => onChange(base64)}
                value={icon}/>

            {icon && crop && cropHandler ? <Cropper
                ref={this.cropperRef}
                className={classes.image}
                src={icon}
                initialAspectRatio={1}
                viewMode={1}
                guides={false}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                checkOrientation={false}
            /> : null}
        </div>;
    }
}

UploadImage.defaultProps = {
    disabled: false,
    maxSize: 10 * 1024,
    icon: null,
    removeIconFunc: null,
    accept: 'image/*',
    error: false,
    onChange: base64 => console.log(base64),
    t: el => el,
    crop: false
}

UploadImage.propTypes = {
    classes: PropTypes.object,
    maxSize: PropTypes.number,
    disabled: PropTypes.bool,
    crop: PropTypes.bool,
    error: PropTypes.bool,
    onChange: PropTypes.func,
    accept: PropTypes.string,
    t: PropTypes.func,
};

export default withStyles(styles)(UploadImage);
