import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from '../Utils';
import I18n from '../i18n';

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
    }
};

class Generic extends Component {
    static propTypes = {
        id:             PropTypes.string,
        objects:        PropTypes.object.isRequired,
        states:         PropTypes.object.isRequired,
        label:          PropTypes.string,
        channelName:    PropTypes.string,
        enumName:       PropTypes.string
    };

    constructor(props, noSubscribe) {
        super(props);
        if (typeof noSubscribe !== 'boolean' || !noSubscribe) {
            this.state = {
                state: null
            };
            if (this.props.id && this.props.objects[this.props.id] && this.props.objects[this.props.id].type === 'state') {
                this.onCollectIds(this.props.id, true);
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

    getObjectName() {
        return Generic.getObjectNameSpan(this.props.objects, this.props.id, this.props.label, this.props.channelName, this.props.enumName);
    }

    // default handler
    updateState(id, state) {

    }

    // default handler
    onControl(id, val) {

    }

    onCollectIds(id, isMount) {
        this.subscribed = this.subscribed || [];

        if (isMount) {
            if (this.subscribed[id]) return;
            this.subscribed[id] = this.subscribed[id] || 0;
            this.subscribed[id]++;

            if (this.subscribed[id] === 1 && this.props.onCollectIds) {
                this.props.onCollectIds(this, typeof id === 'object' ? id : [id], true);
            }
        } else {
            if (this.subscribed[id] !== undefined) {
                this.subscribed[id]--;
                if (this.subscribed[id] < 0) {
                    console.error('Invalid subscribe state');
                }
                if (this.subscribed[id] <= 0) {
                    delete this.subscribed[id];
                    if (this.props.onCollectIds) {
                        this.props.onCollectIds(this, typeof id === 'object' ? id : [id], false);
                    }
                }
            } else {
                console.error('Invalid unsubscribe state');
            }
        }
    }

    componentWillUnmount() {
        if (this.props.onCollectIds && this.subscribed) {
            let ids = Object.keys(this.subscribed);
            if (ids.length) {
                this.props.onCollectIds(this, ids, false);
            }
        }
    }

    wrapContent(content) {
        return (<div style={{paddingTop: this.props.label ? 0: '0.3em'}}>{content}</div>);
    }

    render() {
        return this.wrapContent(this.getObjectName());
    }
}

export default Generic;

