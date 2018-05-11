import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from '../Utils';
import I18n from '../i18n';
import Theme from '../theme';

const styles = {
    header: {
        overflow: 'hidden',
        fontWeight: 'bold',
        height: '2em',
        position: 'relative',
        whiteSpace: 'nowrap'
    },
    subHeader:{
        fontSize: '0.75em',
        fontWeight: 'normal',
        position: 'absolute',
        lineHeight: '0.75em',
        bottom: 0,
        left: '0.5em',
        whiteSpace: 'nowrap'
    },
    tile: Theme.tile
};

class Generic extends Component {
    static propTypes = {
        objects:        PropTypes.object.isRequired,
        states:         PropTypes.object.isRequired,
        tile:           PropTypes.object.isRequired,
        channelInfo:    PropTypes.object.isRequired,
        // registerHandler
        enumName:       PropTypes.string
    };

    constructor(props, noSubscribe) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.subscribes = null;
        this.width = Generic.styles.tile.width;
        this.height = Generic.styles.tile.height;

        if (typeof noSubscribe !== 'boolean' || !noSubscribe) {
            this.state = {};

            if (this.channelInfo.states) {
                let ids = [];
                this.channelInfo.states.forEach(state => {
                    if (state.id && this.props.objects[state.id] && this.props.objects[state.id].type === 'state' && ids.indexOf(state.id) === -1) {
                        ids.push(state.id);
                    }
                });
                if (ids.length) {
                    this.subscribes = ids;
                    this.props.onCollectIds(this, ids, true);
                    ids.forEach(id => this.state[id] = this.props.states[id] ? this.props.states[id].val : null);
                }
            }
        }
    }

    static getObjectNameSpan(objects, id, label, channelName, enumName) {
        if (label && !id) {
            return (<span style={styles.header}>{Generic.getObjectName(objects, id, label, channelName, enumName) || ''}</span>);
        } else
        if (label && id) {
            return (<div style={styles.header}>{Generic.getObjectName(objects, id, label, channelName, enumName) || ''}
                <div style={styles.subHeader}>{Generic.getObjectName(objects, id, '', label, enumName) || ''}</div>
            </div>);
        } else {
            return (<span>{Generic.getObjectName(objects, id, label, channelName, enumName)}</span>);
        }
    }

    static styles = styles;

    static getObjectName(objects, id, label, channelName, enumName) {
        let name;
        if (label) {
            name = label;
        } else
        if (!id) {
            name = 'No elements';
        } else {
            if (objects[enumName]) {
                enumName = Generic.getObjectName(objects, enumName);
            }

            let item = objects[id];
            if (item && item.common && item.common.name) {
                name = Utils.getObjectName(objects, id);

                if (enumName) {
                    let reg = new RegExp('\\b' + enumName + '\\b');
                    name = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                }
                if (channelName) {
                    let reg = new RegExp(channelName + '[.: ]?');
                    name = name.replace(reg, ' ').trim();
                }

                if (name && name === name.toUpperCase()) {
                    name = name[0] + name.substring(1).toLowerCase();
                }
            } else {
                let pos = id.lastIndexOf('.');
                name = id.substring(pos + 1).replace(/_/g, ' ');
                name = Utils.CapitalWords(name);

                if (enumName) {
                    let reg = new RegExp('\\b' + enumName + '\\b');
                    name = name.replace(reg, ' ').replace(/\s\s/g, '').trim();
                }

                if (channelName) {
                    let reg = new RegExp(channelName + '[.: ]?');
                    name = I18n.t(name.replace(reg, ' ').trim());
                }
            }
        }
        return name.trim();
    }

    static getChannelFromState(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        } else {
            return id;
        }
    }

    getObjectName() {
        return Generic.getObjectNameSpan(this.props.objects, this.props.id, this.props.label, this.props.channelName, this.props.enumName);
    }

    // default handler
    updateState(id, state) {

    }

    // default handler
    onControl(id, val) {

    }

    componentWillUnmount() {
        if (this.props.onCollectIds && this.subscribed) {
            this.props.onCollectIds(this, this.subscribed, false);
        }
    }

    wrapContent(content) {
        return (<div>{content}</div>);
    }

    render() {
        return this.wrapContent(this.getObjectName());
    }
}

export default Generic;

