import React, {Component} from 'react';
import PropTypes from 'prop-types';

const styles = {
    state: {
        stroke: 'currentColor',
        fill: 'none',
        strokeWidth: 12,
        strokeLinejoin: 'round',
        strokeMiterlimit: 10
    }
};

class IconHome extends Component {// override constructor
    static propTypes = {
        isOn: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props, true)
    }


    render() {
        return <svg width="24" height="24" viewBox="-20 -20 190 190" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
                <filter id="glow" x="-5000%" y="-5000%" width="10000%" height="10000%">
                    <feFlood result="flood" floodColor="#70C5FF" floodOpacity="1"></feFlood>
                    <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
                    <feMorphology in="mask" result="dilated" operator="dilate" radius="2"></feMorphology>
                    <feGaussianBlur in="dilated" result="blurred" stdDeviation="5"></feGaussianBlur>
                    <feMerge>
                        <feMergeNode in="blurred"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                </filter>
            </defs>
            <path style={styles.state} filter={this.props.isOn ? 'url(#glow)' : ''} className="path" d="M0,109v36.3c0,5.3,3.7,9.7,8.3,9.7h50.1v-23h37v23H153V84H0l28.4-29V13h18.1v24L76.5,0l66.2,69" />
        </svg>;
    }
}


// which makes this reusable component for other views
export default IconHome;