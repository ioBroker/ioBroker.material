import React from 'react';
import Dropzone from 'react-dropzone';
import IconDelete from 'react-icons/lib/md/delete';
import IconOpen from 'react-icons/lib/md/file-upload';
import IconClose from 'react-icons/lib/md/close';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import ImageList from './ImageList';

// Icons
import IconList from '../../icons/icons';

const style = {
    label: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: 12,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: 1,
        paddingTop: 10,
        paddingBottom: 5
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
        color: 'white',
        opacity: 0.9,
        position: 'absolute',
        top: 10,
        right: 10
    },
    openIcon: {
        color: 'white',
        opacity: 0.9,
        position: 'absolute',
        right: 10
    },
    imageBar: {
        bar: {

        },
        imageButton: {

        },
        image: {

        }
    }
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
        textAccepted:    PropTypes.string,
        textRejected:    PropTypes.string,
        textWaiting:     PropTypes.string
    };

    constructor(props) {
        super(props);
        const state = {
            imageStatus: 'wait',
            image:  this.props.image,
            images: this.props.images,
            opened: !this.props.image
        };
        if (this.props.icons) {
            this.icons = IconList.List;
        }
        this.state = state;
    }
    componentWillUpdate(nextProps, nextState) {
        if (!this.props.icons && JSON.stringify(nextProps.images) !== JSON.stringify(this.state.images)) {
            this.setState({images: nextProps.images});
        }
    }
    static readFile(file, cb) {
        const reader = new FileReader();
        reader.onload = () => {
            cb(null, {data: btoa(reader.result), ext: file.name.split('.').pop().toLowerCase(), preview: file.preview});
        };
        reader.onabort = () => {
            console.error('file reading was aborted');
            cb('file reading was aborted');
        };
        reader.onerror = (e) => {
            console.error('file reading has failed');
            cb('file reading has failed: ' + e);
        };

        reader.readAsBinaryString(file);
    }

    handleSelectImage(file) {
        this.setState({image: file});
        this.props.onUpload && this.props.onUpload(file);
    }

    handleDropImage(files) {
        const file = files[files.length - 1];

        ImageSelector.readFile(file, (err, result) => {
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

    render() {
        const _style = Object.assign({}, style.dropzone, this.state.imageStatus === 'accepted' ? style.dropzoneAccepted : (this.state.imageStatus === 'accepted' ? style.dropzoneRejected : {}));

        return (<div style={{position: 'relative'}}>
            <div key={'image-label'} style={style.label}>{this.props.label}</div>
            {this.state.image ? [
                (<img key={'image-preview'}
                      src={typeof this.state.image === 'object' ? this.state.image.preview : this.state.image}
                      alt={this.props.label || ''} style={{width: this.props.height || '100%', height: 'auto'}}/>),
                (<Button key={'image-delete'} onClick={this.removeImage.bind(this)} style={style.deleteIcon} variant="fab" mini aria-label="delete">
                    <IconDelete />
                </Button>),
                (<Button key={'image-open'} onClick={() => this.setState({opened: !this.state.opened})}
                         style={!this.state.opened ? Object.assign({}, style.openIcon, {bottom: -14}) : Object.assign({}, style.openIcon, {bottom: 120})} variant="fab" mini aria-label="delete">
                    {this.state.opened ? (<IconClose />) : (<IconOpen/>)}
                </Button>)
            ] : null}
            {this.state.opened &&
                [
                    ((this.state.images && this.state.images.length) || this.icons) && (<ImageList key={'image-list'} images={this.state.images || this.icons} onSelect={this.handleSelectImage.bind(this)}/>),
                    (<Dropzone key={'image-drop'} maxSize={this.props.maxSize} onDrop={files => this.handleDropImage(files)} accept="image/jpeg, image/png" style={_style}>
                        {
                            ({isDragActive, isDragReject}) => {
                                if (isDragActive) {
                                    if (this.state.imageStatus !== 'accepted') {
                                        this.setState({imageStatus: 'accepted'});
                                    }

                                    return this.props.textAccepted || 'All files will be accepted';
                                } else
                                if (isDragReject) {
                                    if (this.state.imageStatus !== 'rejected') {
                                        this.setState({imageStatus: 'rejected'});
                                    }
                                    return this.props.textRejected || 'Some files will be rejected';
                                } else {
                                    if (this.state.imageStatus !== 'wait') {
                                        this.setState({imageStatus: 'wait'});
                                    }
                                    return this.props.textWaiting || 'Drop some files here or click...';
                                }
                            }
                        }
                    </Dropzone>)
                ]
            }
        </div>);
    }
}

export default ImageSelector;
