import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from '../Utils';
import I18n from '../i18n';
import Theme from '../theme';
import IconCheck from 'react-icons/lib/md/check';
import IconRemoved from 'react-icons/lib/md/remove';
import IconEdit from 'react-icons/lib/md/edit';


class SmartGeneric extends Component {
    static propTypes = {
        objects:        PropTypes.object.isRequired,
        states:         PropTypes.object.isRequired,
        tile:           PropTypes.object.isRequired,
        channelInfo:    PropTypes.object.isRequired,
        enumName:       PropTypes.string
    };

    constructor(props, noSubscribe) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.subscribes = null;
        this.width = Theme.tile.width;
        this.height = Theme.tile.height;
        this.stateRx = {settings: {}};
        this.state = {
            executing: false
        };

        this.editMode = this.props.editMode;

        if (typeof noSubscribe !== 'boolean' || !noSubscribe) {
            if (this.channelInfo.states) {
                let ids = [];
                this.channelInfo.states.forEach(state => {
                    if (state.id && this.props.objects[state.id] && this.props.objects[state.id].type === 'state' && ids.indexOf(state.id) === -1) {
                        ids.push(state.id);
                    }
                });
                if (ids.length) {
                    this.subscribes = ids;

                    // do not want to mutate via setState, because it is constructor
                    ids.forEach(id => this.stateRx[id] = this.props.states[id] ? this.props.states[id].val : null);
                }
            }
        }

        // will be done in componentReady
        // this.state = stateRx;
    }

    componentReady () {
        if (this.id && this.props.objects[this.id]) {
            if (this.props.objects[this.id].type === 'state') {
                let channel = SmartGeneric.getParentId(this.id);
                if (this.props.objects[channel] && (this.props.objects[channel].type === 'channel' || this.props.objects[channel].type === 'device')) {
                    this.settingsId = channel;
                }
            } else {
                this.settingsId = this.id;
            }
        }

        this.stateRx.settings = Utils.getSettings(this.props.objects[this.settingsId]);

        this.state = this.stateRx;
        delete this.stateRx;
    }

    componentDidMount () {
        if (this.state.settings.enabled && this.subscribes && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        }
    }

    static getObjectName(objects, id, label, channelName, enumName) {
        let name;
        if (label) {
            name = label;
        } else
        if (!id) {
            name = 'No elements';
        } else {
            if (objects[enumName]) {
                enumName = SmartGeneric.getObjectName(objects, enumName);
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

    static getParentId(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        } else {
            return id;
        }
    }

    getObjectNameCh() {
        const channelId = SmartGeneric.getParentId(this.id);
        if (this.props.objects[channelId] && (this.props.objects[channelId].type === 'channel' || this.props.objects[channelId].type === 'device')) {
            return SmartGeneric.getObjectName(this.props.objects, channelId, null, null, this.props.enumName) || '&nbsp;';
        } else {
            return SmartGeneric.getObjectName(this.props.objects, this.id, null, null, this.props.enumName) || '&nbsp;';
        }
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
            this.subscribed = null;
        }
    }

    saveSettings() {
        this.props.onSaveSettings && this.props.onSaveSettings(this.settingsId, this.state.settings);

        // subscribe if enabled and was not subscribed
        if (this.state.settings.enabled && !this.subscribed) {
            this.subscribed = true;
            this.props.onCollectIds(this, this.subscribes, true);
        } else
        // unsubscribe if disabled and was subscribed
        if (!this.state.settings.enabled && this.subscribed) {
            this.subscribed = false;
            this.props.onCollectIds(this, this.subscribes, false);
        }
    }

    toggleEnabled() {
        let settings = JSON.parse(JSON.stringify(this.state.settings));
        settings.enabled = !settings.enabled;

        this.setState({settings});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.editMode !== this.state.editMode) {
            if (this.state.editMode) {
                this.saveSettings();
            }
            this.setState({editMode: nextProps.editMode});
            this.props.tile.setVisibility(nextProps.editMode || this.state.settings.enabled);
        }
    }

    // following indicators are supported
    // indicator.working
    // indicator.lowbat
    // indicator.maintenance.lowbat
    // indicator.maintenance.unreach
    // indicator.maintenance
    getIndicators() {
        let result = [];
        this.channelInfo.states.forEach(state =>  {
            if (state.indicator && state.id && this.state[state.id]) {
                const Icon = state.icon;
                result.push((<Icon key={this.id + '.indicator-' + state.name.toLowerCase()} className={'indicator-' + state.name.toLowerCase()} style={Object.assign({}, Theme.tile.tileIndicator, {color: state.color})}/>));
            }
        });

        if (result.length) {
            return (<div style={Theme.tile.tileIndicators}>{result}</div>);
        } else {
            return null;
        }
    }

    wrapContent(content) {
        if (this.state.editMode) {
            return (<div>
                {this.state.settings.enabled ?
                    [(<div onClick={this.toggleEnabled.bind(this)} key={this.id + '.icon-check'} style={Object.assign({}, Theme.tile.editMode.checkIcon)}>
                            <IconCheck width={'100%'} height={'100%'} />
                    </div>),
                    (<div key={this.id + '.icon-edit'} style={Object.assign({}, Theme.tile.editMode.editIcon)}>
                        <IconEdit width={'100%'} height={'100%'} style={{width: '80%', marginLeft: '20%'}}/>
                        </div>
                    )]
                    :
                    (<div onClick={this.toggleEnabled.bind(this)} key={this.id + '.icon-check'} style={Object.assign({}, Theme.tile.editMode.removeIcon)}>
                        <IconRemoved width={'100%'} height={'100%'}/>
                    </div>)
                }
                {content}</div>);
        } else if (this.state.settings.enabled) {
            return (<div>{this.getIndicators()} {content}</div>);
        } else {
            return null;
        }
    }

    render() {
        if (!this.state.editMode && !this.state.settings.enabled) {
            return null;
        } else {
            return this.wrapContent(this.getObjectNameCh());
        }
    }
}

export default SmartGeneric;

