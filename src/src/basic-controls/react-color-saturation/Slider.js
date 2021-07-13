import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import keycode from 'keycode';
import clsx from 'clsx';
import withStyles from '@material-ui/core/styles/withStyles';
import ButtonBase from '@material-ui/core/ButtonBase';
import { fade } from '@material-ui/core/styles/colorManipulator';

function clamp(value, min = 0, max = 100) {
    return Math.min(Math.max(value, min), max);
}

export const styles = theme => {
    const commonTransitionsOptions = {
        duration: theme.transitions.duration.short,
        easing: theme.transitions.easing.easeOut,
    };

    const commonTransitions = theme.transitions.create(
        ['width', 'height', 'left', 'top', 'box-shadow'],
        commonTransitionsOptions,
    );
    // no transition on the position
    const thumbActivatedTransitions = theme.transitions.create(
        ['width', 'height', 'box-shadow'],
        commonTransitionsOptions,
    );

    const colors = {
        primary: theme.palette.primary.main,
        disabled: theme.palette.grey[400],
    };

    return {
        /* Styles applied to the root element. */
        root: {
            position: 'relative',
            width: '100%',
            padding: '16px 8px',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            '&$disabled': {
                cursor: 'no-drop',
            },
            '&$vertical': {
                height: '100%',
                padding: '8px 16px',
            },
            '&$reverse': {
                transform: 'scaleX(-1)',
            },
            '&$vertical$reverse': {
                transform: 'scaleY(-1)',
            },
        },
        /* Styles applied to the container element. */
        container: {
            position: 'relative',
            '&$vertical': {
                height: '100%',
            },
        },
        /* Styles applied to the track elements. */
        track: {
            position: 'absolute',
            transform: 'translate(0, -50%)',
            top: '50%',
            height: 2,
            backgroundColor: colors.primary,
            '&$activated': {
                transition: 'none',
            },
            '&$disabled': {
                backgroundColor: colors.disabled,
            },
            '&$vertical': {
                transform: 'translate(-50%, 0)',
                left: '50%',
                top: 'initial',
                width: 2,
            },
        },
        /* Styles applied to the track element before the thumb. */
        trackBefore: {
            zIndex: 1,
            left: 0,
            transition: commonTransitions,
        },
        /* Styles applied to the track element after the thumb. */
        trackAfter: {
            right: 0,
            opacity: 0.24,
            transition: commonTransitions,
            '&$vertical': {
                bottom: 0,
            },
        },
        /* Styles applied to the thumb element. */
        thumb: {
            position: 'absolute',
            zIndex: 2,
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            transition: commonTransitions,
            backgroundColor: colors.primary,
            '&$focused': {
                boxShadow: `0px 0px 0px 9px ${fade(colors.primary, 0.16)}`,
            },
            '&$activated': {
                width: 17,
                height: 17,
                transition: thumbActivatedTransitions,
            },
            '&$disabled': {
                cursor: 'no-drop',
                width: 9,
                height: 9,
                backgroundColor: colors.disabled,
            },
            '&$jumped': {
                width: 17,
                height: 17,
            },
        },
        /* Class applied to the root element to trigger JSS nested styles if `reverse={true}` . */
        reverse: {},
        /* Class applied to the track and thumb elements to trigger JSS nested styles if `disabled`. */
        disabled: {},
        /* Class applied to the track and thumb elements to trigger JSS nested styles if `jumped`. */
        jumped: {},
        /* Class applied to the track and thumb elements to trigger JSS nested styles if `focused`. */
        focused: {},
        /* Class applied to the track and thumb elements to trigger JSS nested styles if `activated`. */
        activated: {},
        /* Class applied to the root, track and container to trigger JSS nested styles if `vertical`. */
        vertical: {},
    };
};

function percentToValue(percent, min, max) {
    return ((max - min) * percent) / 100 + min;
}

function roundToStep(number, step) {
    return Math.round(number / step) * step;
}

function getOffset(node) {
    const { pageYOffset, pageXOffset } = global;
    const { left, top } = node.getBoundingClientRect();

    return {
        top: top + pageYOffset,
        left: left + pageXOffset,
    };
}

function getMousePosition(event) {
    if (event.changedTouches && event.changedTouches[0]) {
        return {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY,
        };
    }

    return {
        x: event.pageX,
        y: event.pageY,
    };
}

function calculatePercent(node, event, isVertical, isReverted) {
    const { width, height } = node.getBoundingClientRect();
    const { top, left } = getOffset(node);
    const { x, y } = getMousePosition(event);

    const value = isVertical ? y - top : x - left;
    const onePercent = (isVertical ? height : width) / 100;

    return isReverted ? 100 - clamp(value / onePercent) : clamp(value / onePercent);
}

function preventPageScrolling(event) {
    event.preventDefault();
}

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production' && !React.createContext) {
    throw new Error('Material-UI: react@16.3.0 or greater is required.');
}

class Slider extends React.Component {
    state = { currentState: 'initial' };

    jumpAnimationTimeoutId = -1;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.containerRef) {
            this.containerRef.addEventListener('touchstart', preventPageScrolling, { passive: false });
        }
    }

    componentWillUnmount() {
        this.containerRef.removeEventListener('touchstart', preventPageScrolling, { passive: false });
        // document.body.removeEventListener('mousemove', this.handleMouseMove);
        document.body.removeEventListener('mouseup', this.handleMouseUp);
        // document.body.removeEventListener('touchmove', this.handleMouseMove);
        document.body.removeEventListener('touchend', this.handleMouseUp);
        clearTimeout(this.jumpAnimationTimeoutId);
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed = false;
        if (props.disabled && state.currentState !== 'disabled') {
            changed = true;
            newState.currentState = 'disabled';
        }

        if (!props.disabled && state.currentState === 'disabled') {
            changed = true;
            newState.currentState = 'normal';
        }

        return changed ? newState : null;
    }

    handleKeyDown = event => {
        const { min, max, value: currentValue } = this.props;

        const onePercent = Math.abs((max - min) / 100);
        const step = this.props.step || onePercent;
        let value;

        switch (keycode(event)) {
            case 'home':
                value = min;
                break;
            case 'end':
                value = max;
                break;
            case 'page up':
                value = currentValue + onePercent * 10;
                break;
            case 'page down':
                value = currentValue - onePercent * 10;
                break;
            case 'right':
            case 'up':
                value = currentValue + step;
                break;
            case 'left':
            case 'down':
                value = currentValue - step;
                break;
            default:
                return;
        }

        event.preventDefault();

        value = clamp(value, min, max);

        this.emitChange(event, value);
    };

    handleFocus = () => {
        this.setState({currentState: 'focused'});
    };

    handleBlur = () => {
        this.setState({currentState: 'normal'});
    };

    handleClick = event => {
        const { min, max, vertical, reverse } = this.props;
        const percent = calculatePercent(this.containerRef, event, vertical, reverse);
        const value = percentToValue(percent, min, max);

        this.emitChange(event, value, () =>
            this.playJumpAnimation());
    };

    handleTouchStart = event =>
        this.handleMouseDown(event, true);

    handleMouseDown = (event, isTouch) => {
        event.preventDefault();
        this.setState({currentState: 'activated'});
        this.touch = isTouch;
        this.moved = false;

        // document.body.addEventListener('mousemove', this.handleMouseMove);
        document.body.addEventListener('mouseup',   this.handleMouseUp);
        // document.body.addEventListener('touchmove', this.handleMouseMove);
        document.body.addEventListener('touchend',  this.handleMouseUp);

        typeof this.props.onDragStart === 'function' && this.props.onDragStart(event);
    };

    handleMouseUp = event => {
        this.setState({ currentState: 'normal' });

        // document.body.removeEventListener('mousemove', this.handleMouseMove);
        document.body.removeEventListener('mouseup',   this.handleMouseUp);
        // document.body.removeEventListener('touchmove', this.handleMouseMove);
        document.body.removeEventListener('touchend',  this.handleMouseUp);

        typeof this.props.onDragEnd === 'function' && this.props.onDragEnd(event);
        this.touch && !this.moved && this.handleClick(event);
    };

    handleMouseMove = event => {
        const { min, max, vertical, reverse } = this.props;
        const percent = calculatePercent(this.containerRef, event, vertical, reverse);
        const value = percentToValue(percent, min, max);
        this.moved = true;

        this.emitChange(event, value);
    };

    emitChange(event, rawValue, callback) {
        const { step, value: previousValue, onChange, disabled } = this.props;
        let value = rawValue;

        if (disabled) {
            return;
        }

        if (step) {
            value = roundToStep(rawValue, step);
        } else {
            value = Number(rawValue.toFixed(3));
        }

        if (typeof onChange === 'function' && value !== previousValue) {
            onChange(event, value);

            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    calculateTrackAfterStyles(percent) {
        const { currentState } = this.state;

        switch (currentState) {
            case 'activated':
                return `calc(100% - ${percent === 0 ? 7 : 5}px)`;
            case 'disabled':
                return `calc(${100 - percent}% - 6px)`;
            default:
                return 'calc(100% - 5px)';
        }
    }

    calculateTrackBeforeStyles(percent) {
        const { currentState } = this.state;

        switch (currentState) {
            case 'disabled':
                return `calc(${percent}% - 6px)`;
            default:
                return `${percent}%`;
        }
    }

    playJumpAnimation() {
        this.setState({ currentState: 'jumped' }, () => {
            clearTimeout(this.jumpAnimationTimeoutId);
            this.jumpAnimationTimeoutId = setTimeout(() => {
                this.setState({ currentState: 'normal' });
            }, this.props.theme.transitions.duration.complex);
        });
    }

    render() {
        const { currentState } = this.state;
        const {
            component: Component,
            classes,
            className: classNameProp,
            disabled,
            max,
            min,
            reverse,
            theme,
            value,
            vertical,
            ...other
        } = this.props;

        const percent = clamp(((value - min) * 100) / (max - min));

        const commonClasses = {
            [classes.disabled]: disabled,
            [classes.jumped]: !disabled && currentState === 'jumped',
            [classes.focused]: !disabled && currentState === 'focused',
            [classes.activated]: !disabled && currentState === 'activated',
        };

        const className = clsx(
            classes.root,
            vertical && classes.vertical,
            reverse && classes.reverse,
            disabled && classes.disabled,
            classNameProp,
        );

        const containerClasses = clsx(classes.container, vertical && classes.vertical);

        const trackBeforeClasses = clsx(classes.track, classes.trackBefore, commonClasses, vertical && classes.vertical);

        const trackAfterClasses = clsx(classes.track, classes.trackAfter, commonClasses, vertical && classes.vertical);

        const thumbClasses = clsx(classes.thumb, commonClasses);

        const trackProperty = vertical ? 'height' : 'width';
        const thumbProperty = vertical ? 'top' : 'left';
        const inlineTrackBeforeStyles = { [trackProperty]: this.calculateTrackBeforeStyles(percent) };
        const inlineTrackAfterStyles = { [trackProperty]: this.calculateTrackAfterStyles(percent) };
        const inlineThumbStyles = { [thumbProperty]: `${percent}%` };

        return <Component
            role="slider"
            className={className}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            onClick={this.handleClick}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleTouchStart}
            ref={ref => {
                this.containerRef = findDOMNode(ref);
            }}
            {...other}
        >
            <div className={containerClasses}>
                <div className={trackBeforeClasses} style={inlineTrackBeforeStyles} />
                <ButtonBase
                    className={thumbClasses}
                    disableRipple
                    style={inlineThumbStyles}
                    onBlur={this.handleBlur}
                    onKeyDown={this.handleKeyDown}
                    onFocusVisible={this.handleFocus}
                />
                <div className={trackAfterClasses} style={inlineTrackAfterStyles} />
            </div>
        </Component>;
    }
}

Slider.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     * See [CSS API](#css-api) below for more details.
     */
    classes: PropTypes.object.isRequired,
    /**
     * @ignore
     */
    className: PropTypes.string,
    /**
     * The component used for the root node.
     * Either a string to use a DOM element or a component.
     */
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
    /**
     * If `true`, the slider will be disabled.
     */
    disabled: PropTypes.bool,
    /**
     * The maximum allowed value of the slider.
     * Should not be equal to min.
     */
    max: PropTypes.number,
    /**
     * The minimum allowed value of the slider.
     * Should not be equal to max.
     */
    min: PropTypes.number,
    /**
     * Callback function that is fired when the slider's value changed.
     */
    onChange: PropTypes.func,
    /**
     * Callback function that is fired when the slide has stopped moving.
     */
    onDragEnd: PropTypes.func,
    /**
     * Callback function that is fired when the slider has begun to move.
     */
    onDragStart: PropTypes.func,
    /**
     * If `true`, the slider will be reversed.
     */
    reverse: PropTypes.bool,
    /**
     * The granularity the slider can step through values.
     */
    step: PropTypes.number,
    /**
     * @ignore
     */
    theme: PropTypes.object.isRequired,
    /**
     * The value of the slider.
     */
    value: PropTypes.number.isRequired,
    /**
     * If `true`, the slider will be vertical.
     */
    vertical: PropTypes.bool,
};

Slider.defaultProps = {
    min: 0,
    max: 100,
    component: 'div',
};

export default withStyles(styles, { name: 'MuiSlider', withTheme: true })(Slider);
