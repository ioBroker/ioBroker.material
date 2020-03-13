/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
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
import { withStyles } from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';

import {MdDelete as IconDelete} from 'react-icons/md';
import {MdFileUpload as IconOpen} from 'react-icons/md';
import {MdClose as IconClose} from 'react-icons/md';
import {MdCameraAlt as IconCam} from 'react-icons/md';
import {MdFileUpload as IconUpload} from 'react-icons/md';
import {MdCancel as IconNo} from 'react-icons/md';
import {MdPlusOne as IconPlus} from 'react-icons/md';

import Fab from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import ImageList from './ImageList';
import ReactCrop/*, { makeAspectCrop } */from 'react-image-crop';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import NoImage from '../../assets/noImage.png';

import 'react-image-crop/dist/ReactCrop.css'

// Icons
import IconList from '../../icons/icons';
import I18n from "../../i18n";

const style = {
    label: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: 12,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: 1,
        paddingTop: 10,
        paddingBottom: 5
    },
    dropzoneDiv: {
        width: '100%',
        height: '100%'
    },
    dropzone: {
        marginTop: 20,
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
    },
    deleteIcon: {
        //color: 'white',
        opacity: 0.9,
        position: 'absolute',
        top: 10,
        right: 10
    },
    openIcon: {
        //color: 'white',
        opacity: 0.9,
        position: 'absolute',
        right: 10,
        zIndex: 10
    },
    camIcon: {
        position: 'absolute',
        bottom: 8,
        right: 3,
        zIndex: 10,
        cursor: 'pointer'
    },
    iconError: {
        color: '#ffc3c6',
    },
    iconOk: {
        color: '#aaeebc',
    },
    imageBar: {
        bar: {

        },
        imageButton: {

        },
        image: {

        }
    },
    'chart-dialog': {
        zIndex: 2101
    },
    'chart-dialog-paper': {
        width: 'calc(100% - 2em)',
        maxWidth: 'calc(100% - 2em)',
        height: 'calc(100% - 2em)',
        maxHeight: 'calc(100% - 2em)'
    },
    'chart-dialog-img': {

    },
    'chart-dialog-content': {
        width: 'calc(100% - 4em)',
        height: 'calc(100% - 4em)',
        cursor: 'pointer',
        textAlign: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
    },
};

class ImageSelector extends React.Component {
    static propTypes = {
        image:           PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]).isRequired,
        onUpload:        PropTypes.func.isRequired,
        maxSize:         PropTypes.number,
        height:          PropTypes.number, // height of the shown image
        images:          PropTypes.array,
        icons:           PropTypes.bool,
        label:           PropTypes.string,
        accept:          PropTypes.string,
        textAccepted:    PropTypes.string,
        textRejected:    PropTypes.string,
        textWaiting:     PropTypes.string,
        aspect:          PropTypes.number // if set, the crop function will be called
    };

    constructor(props) {
        super(props);
        const state = {
            imageStatus: 'wait',
            image:  this.props.image,
            beforeCrop: null,
            images: this.props.images,
            opened: !this.props.image,
            cropOpened: false,
            crop: null,
            cropWidth: 100,
            cropHeight: 100
        };
        if (this.props.icons) {
            this.icons = IconList.List;
        }
        this.cropPixels = null;
        this.inputRef = React.createRef();
        this.cropRef = React.createRef();
        this.state = state;
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (!this.props.icons && JSON.stringify(nextProps.images) !== JSON.stringify(this.state.images)) {
            this.setState({images: nextProps.images});
        }
    }

    /**
     * Crop image in the browser.
     *
     * @param {Object} imageData - Image File Object
     * @param {Object} crop - crop Object provided by react-image-crop
     * @param {String} fileName - File name
     * @param {Function} cb - Callback
     */
    static cropImage(imageData, crop, fileName, cb) {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');
        const image = new Image();
        // only in URL allowed names
        fileName = fileName.replace(/#\*\?=:\+/g, '_');
        image.onload = function() {
            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                crop.width,
                crop.height
            );

            cb(null, {data: canvas.toDataURL('image/jpeg'), name: fileName});
        };
        image.src = imageData;
    }

    static readFileDataUrl(file, cb) {
        const reader = new FileReader();
        reader.onload = () => {
            cb(null, {data: reader.result, name: file.name});
        };
        reader.onabort = () => {
            console.error('file reading was aborted');
            cb('file reading was aborted');
        };
        reader.onerror = (e) => {
            console.error('file reading has failed');
            cb('file reading has failed: ' + e);
        };

        reader.readAsDataURL(file)
    }

    handleSelectImage(file) {
        if (typeof file === 'object') {
            if (this.props.aspect) {
                this.setState({beforeCrop: file, cropOpened: true});
            } else {
                this.setState({image: file.data, errored: false});
                this.props.onUpload && this.props.onUpload(file);
            }
        } else {
            this.setState({image: file, errored: false});
            this.props.onUpload && this.props.onUpload(file);
        }
    }

    handleDropImage(files) {
        if (files && files.hasOwnProperty('target')) {
            files = files.target.files;
        }

        if (!files && !files.length) return;
        const file = files[files.length - 1];

        if (!file) {
            return;
        }
        ImageSelector.readFileDataUrl(file, (err, result) => {
            if (err) {
                alert(err);
            } else {
                this.handleSelectImage(result);
            }
        });
    }

    removeImage() {
        this.setState({image: '', opened: true});
        this.props.onUpload && this.props.onUpload('');
    }

    static isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    }

    onCamera() {
        this.inputRef.current.click();
    }

    onCropEnd(){
        ImageSelector.cropImage(this.state.beforeCrop.data, this.cropPixels, this.state.beforeCrop.name, (err, file) => {
            this.setState({cropOpened: false, image: file.data});
            this.props.onUpload && this.props.onUpload(file);
        });
    }

    onImageLoaded(image, tryCount) {
        tryCount = tryCount || 0;
        let cropHeight;
        let cropWidth;
        let width;
        let height;
        if (!this.cropRef.current && tryCount < 10) {
            return setTimeout(() => this.onImageLoaded(image, tryCount + 1), 200);
        }
        let aspect = this.props.aspect || 1;

        if (this.cropRef.current) {
            if (this.cropRef.current.clientWidth > this.cropRef.current.clientHeight) {
                cropHeight = this.cropRef.current.clientHeight;
                if (cropHeight > image.naturalHeight) {
                    cropHeight = image.naturalHeight;
                }
                cropWidth = cropHeight * (image.naturalWidth / image.naturalHeight);
                height = 100;
                width = (image.naturalHeight / image.naturalWidth) * 100 * aspect;
                if (width > 100) {
                    height = 100 / width * 100;
                    width = 100;
                }
            } else {
                cropWidth = this.cropRef.current.clientWidth;
                if (cropWidth > image.naturalWidth) {
                    cropWidth = image.naturalWidth;
                }
                cropHeight = cropWidth * (image.naturalHeight / image.naturalWidth);
                width = 100;
                height = (image.naturalWidth / image.naturalHeight) * 100 / aspect;
				if (height > 100) {
                    width = 100 / height * 100;
                    height = 100;
                }
            }
        }
        this.setState({
            cropHeight,
            cropWidth,
            crop: {x: 0, y: 0, width, height, aspect: aspect}
        });
    }

    render() {
        //const _style = Object.assign({}, style.dropzone, this.state.imageStatus === 'accepted' ? style.dropzoneAccepted : (this.state.imageStatus === 'rejected' ? style.dropzoneRejected : {}));
        const className = this.props.classes.dropzone + ' ' + (this.state.imageStatus === 'accepted' ? this.props.classes.dropzoneAccepted : (this.state.imageStatus === 'rejected' ? this.props.classes.dropzoneRejected : ''));

        return (<div style={{position: 'relative'}}>
            <div key={'image-label'} style={style.label}>{this.props.label}</div>
            {this.state.image ? [
                (<img key={'image-preview'}
                      onError={() => this.setState({errored: true})}
                      src={this.state.errored ? NoImage : (typeof this.state.image === 'object' ? this.state.image.preview : this.state.image)}
                      alt={this.props.label || ''} style={{width: this.props.height || '100%', height: 'auto'}}/>),
                (<Fab key={'image-delete'} onClick={this.removeImage.bind(this)} style={style.deleteIcon} size="small" aria-label="delete">
                    <IconDelete />
                </Fab>),
                (<Fab key={'image-open'} onClick={() => this.setState({opened: !this.state.opened})}
                         style={!this.state.opened ? Object.assign({}, style.openIcon, {bottom: -5}) : Object.assign({}, style.openIcon, {bottom: 120})}  aria-label="delete">
                    {this.state.opened ? (<IconClose />) : (<IconOpen/>)}
                </Fab>)
            ] : null}
            {this.state.opened &&
                [
                    ((this.state.images && this.state.images.length) || this.icons) && (<ImageList key={'image-list'} images={this.state.images || this.icons} onSelect={this.handleSelectImage.bind(this)}/>),
                    ImageSelector.isMobile() && !this.props.icons ?
                        (<Fab key={'image-camera'} onClick={() => this.onCamera()}
                                  style={Object.assign({}, style.camIcon)} size="small" aria-label="camera">
                            <IconCam />
                            <input ref={this.inputRef} type="file" accept="image/*" onChange={files => this.handleDropImage(files)} capture style={{display: 'none'}}/>
                        </Fab>) : null,
                    (<Dropzone key={'image-drop'}
                           maxSize={this.props.maxSize}
                           onDrop={files => this.handleDropImage(files)}
                           accept={this.props.accept || 'image/jpeg, image/png'}
                           className={className}>
                        {
                            ({getRootProps, getInputProps, isDragActive, isDragReject}) => {
                                if (isDragReject) {
                                    if (this.state.imageStatus !== 'rejected') {
                                        this.setState({imageStatus: 'rejected'});
                                    }
                                    return (
                                        <div className={className || this.props.classes.dropzoneDiv} {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <span key="text" className={this.props.classes.text}>{I18n.t('Some files will be rejected')}</span>
                                            <IconNo key="icon" className={this.props.classes.icon + ' ' + this.props.classes.iconError}/>
                                        </div>);
                                } else if (isDragActive) {
                                    if (this.state.imageStatus !== 'accepted') {
                                        this.setState({imageStatus: 'accepted'});
                                    }

                                    return (
                                        <div className={className || this.props.classes.dropzoneDiv} {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <span key="text" className={this.props.classes.text}>{I18n.t('All files will be accepted')}</span>
                                            <IconPlus key="icon" className={this.props.classes.icon + ' ' + this.props.classes.iconOk}/>
                                        </div>);
                                } else {
                                    if (this.state.imageStatus !== 'wait') {
                                        this.setState({imageStatus: 'wait'});
                                    }
                                    return (
                                        <div className={className || this.props.classes.dropzoneDiv} {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <span key="text" className={this.props.classes.text}>{I18n.t('Drop some files here or click...')}</span>
                                            <IconUpload key="icon" className={this.props.classes.icon}/>
                                        </div>);
                                }
                            }
                        }
                    </Dropzone>)
                ]
            }
            {this.state.cropOpened ? (<Dialog
                key="crop-dialog"
                open={true}
                classes={{paper: this.props.classes['chart-dialog-paper']}}
                onClose={() => this.setState({cropOpened: false})}
                className={this.props.classes['chart-dialog']}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">{I18n.t('Crop image')}</DialogTitle>
                <DialogContent className={this.props.classes['chart-dialog-content']}>
                    <div ref={this.cropRef} style={{width: '100%', height: '100%'}}>
                        <ReactCrop style={{width: this.state.cropWidth, height: this.state.cropHeight}}
                                   onChange={crop => this.setState({crop})}
                                   onComplete={(crop, pixelCrop) => this.cropPixels = pixelCrop}
                                   crop={this.state.crop}
                                   keepSelection={true}
                                   onImageLoaded={image => this.onImageLoaded(image)}
                                   aspect={this.props.aspect || 1}
                                   src={this.state.beforeCrop.data} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.onCropEnd(true)} color="primary" autoFocus>{I18n.t('Crop')}</Button>
                    <Button onClick={() => this.setState({cropOpened: false})} autoFocus>{I18n.t('Cancel')}</Button>
                </DialogActions>
            </Dialog>): null}
        </div>);
    }
}

export default withStyles(style)(ImageSelector);
