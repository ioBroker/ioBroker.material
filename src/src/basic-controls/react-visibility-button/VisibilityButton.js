import React from 'react'
import ButtonBase from '@material-ui/core/ButtonBase';
import IconCheck from 'react-icons/lib/md/visibility';
import IconUncheck from 'react-icons/lib/md/visibility-off';
import PropTypes from 'prop-types';
import IconButton    from '@material-ui/core/IconButton';

const styles = {
    button: {
        color: 'black'
    },
    buttonSmall: {
        width: 20,
        height: 20,
        borderRadius: 20,
        position: 'absolute',
        top: 0,
        right: 0,
        color: 'black'
    },
    buttonBig: {
        width: 24,
        height: 24,
        borderRadius: 24
    }
};

class SmallVisibilityButton extends React.Component {
    static propTypes = {
        visible:    PropTypes.bool,
        big:        PropTypes.bool,
        onChange:   PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible
        };
    }

    toggleState = (e) => {
        e.stopPropagation();
        this.props.onChange && this.props.onChange(!this.state.visible);
        this.setState({visible: !this.state.visible});
    };

    render() {
        if (this.props.big) {
            return (<IconButton onClick={e => this.toggleState(e)}  style={Object.assign({}, styles.button, styles.buttonBig)}>
                {this.state.visible ? <IconCheck width={'100%'}/> : <IconUncheck width={'100%'}/>}
            </IconButton>);
        } else {
            const iconStyle = {marginTop: -3, verticalAlign: 'top'};
            return (
                <div style={Object.assign({}, styles.button, styles.buttonSmall)} onClick={e => this.toggleState(e)} className="small-visibility-button">
                    {this.state.visible ? <IconCheck width={16} style={iconStyle}/> : <IconUncheck width={16} style={iconStyle}/>}
                </div>
            )
        }
    }
}

export default SmallVisibilityButton