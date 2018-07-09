import React, {Component} from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import Utils from './Utils';
import Button from '@material-ui/core/Button';
import IconRooms from './icons/IconHome';
import Collapse from '@material-ui/core/Collapse';
import I18n from './i18n'
import VisibilityButton from './basic-controls/react-visibility-button/VisibilityButton';

import IconButton    from '@material-ui/core/IconButton';
import IconFunctions from 'react-icons/lib/md/lightbulb-outline';
import IconFavorites from 'react-icons/lib/md/favorite';
import Theme from './theme';
import ExpandLess from 'react-icons/lib/md/expand-less';
import ExpandMore from 'react-icons/lib/md/expand-more';

const styles = {
    iconsSelected: {
        backgroundColor: 'rgb(204, 204, 204)',
        color: 'white',
        verticalAlign: 'top',
    },
    icons: {
        verticalAlign: 'top',
        color: 'gray'
    },
};

class MenuList extends Component {
    static propTypes = {
        objects:        PropTypes.object.isRequired,
        selectedId:     PropTypes.string,
        editMode:       PropTypes.bool.isRequired,
        user:           PropTypes.string.isRequired,
        root:           PropTypes.string.isRequired,
        onSelectedItemChanged: PropTypes.func.isRequired,
        onRootChanged:  PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.settings = {};

        this.state = {
            selectedIndex:  this.props.defaultValue,
            editMode:       this.props.editMode,
            visibility:     this.fillVisibility().visibility
        };
    }

    fillVisibility(objects, editMode) {
        objects = objects || this.props.objects;
        editMode = (editMode === undefined) ? this.props.editMode : editMode;
        let items = this.getElementsToShow('enum', objects, editMode);
        let changed = false;
        const visibility = {};
        items.forEach(function (e) {
            visibility[e.id] = !(e.settings.enabled === false);
            if (this.state && this.state.visibility[e.id] !== visibility[e.id]) {
                changed = true;
            }
        }.bind(this));
        items = this.getElementsToShow('', objects, editMode);
        items.forEach(function (e) {
            visibility[e.id] = !(e.settings.enabled === false);
            if (this.state && this.state.visibility[e.id] !== visibility[e.id]) {
                changed = true;
            }
        }.bind(this));

        return {changed, visibility};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.editMode !== this.state.editMode) {
            this.setState({editMode: nextProps.editMode});
        }
        if (nextProps.objects) {
            const {changed, visibility} = this.fillVisibility(nextProps.objects, nextProps.editMode);
            if (changed) {
                this.setState({visibility});
            }
        }
    }

    getListHeader() {
        let items = this.getElementsToShow('enum');

        if (items && items.length) {
            return (<ListSubheader style={{background: 'white', borderBottom: '1px solid rgba(0, 0, 0, 0.12)'}}>{
                items.map(function (item) {
                    let settings = this.settings[item.id];

                    if (settings.enabled === false && !this.props.editMode) {
                        return;
                    }

                    const name = settings.name;
                    const visibilityButton = this.props.editMode ? <VisibilityButton visible={this.state.visibility[item.id]} onChange={() => this.onToggleEnabled(null, item.id)}/> : null;
                    let style = item.id === this.props.root ? styles.iconsSelected : styles.icons;
                    if (this.props.editMode && !this.state.visibility[item.id]) {
                        style = Object.assign({}, style, {opacity: 0.5});
                    }

                    if (item.id === 'enum.rooms') {
                        return (<IconButton
                                    key={item.id}
                                    style={style}
                                    tooltip={name}
                                    onClick={() => this.onRootChanged('enum.rooms')}>
                                        <IconRooms name="rooms" width={Theme.iconSize} height={Theme.iconSize} isOn={item.id === this.props.root}/>
                                {visibilityButton}
                        </IconButton>);
                    } else if (item.id === 'enum.functions') {
                        return (<IconButton
                            key={item.id}
                            style={style}
                            tooltip={name}
                            onClick={() => this.onRootChanged('enum.functions')}>
                            <IconFunctions width={Theme.iconSize} height={Theme.iconSize}/>
                            {visibilityButton}
                        </IconButton>);
                    } else if (item.id === 'enum.favorites') {
                        return (<IconButton
                            key={item.id}
                            style={style}
                            tooltip={name}
                            onClick={() => this.onRootChanged('enum.favorites')}>
                            <IconFavorites width={Theme.iconSize} height={Theme.iconSize}/>
                            {visibilityButton}
                        </IconButton>);
                    } else {
                        const icon = Utils.getIcon(item.settings, Theme.menuIcon);

                        return (<Button
                            variant="outlined"
                            style={style}
                            key={item.id}
                            onClick={() => this.onRootChanged(item.id)}>
                            {icon}
                            {name}
                            {visibilityButton}
                            </Button>);
                    }
                }.bind(this))
            }</ListSubheader>);
        } else {
            return '';
        }
    }

    onRootChanged(id) {
        let items = this.getElementsToShow(id);
        let page = items.find(item => {
            return this.props.objects[item.id] && this.props.objects[item.id].common && this.props.objects[item.id].common.members && this.props.objects[item.id].common.members.length
        });
        if (!page) {
            let pages = items.map(item => {
                let ids = this.getElementsToShow(item.id);
                return ids.find(item => {
                    return this.props.objects[item.id] && this.props.objects[item.id].common && this.props.objects[item.id].common.members && this.props.objects[item.id].common.members.length
                });
            });
            page = pages.find(item => pages[0]);
        }
        this.props.onRootChanged && this.props.onRootChanged(id, page && page.id);
    }

    getElementsToShow(root, _objects, editMode) {
        root = root || this.props.root;

        editMode = (editMode === undefined) ? this.props.editMode : editMode;
        let objects = _objects || this.props.objects;
        let items     = [];
        let reg       = root ? new RegExp('^' + root + '\\.') : new RegExp('^[^.]$');
        let rootParts = root.split('.');

        for (let id in objects) {
            if (objects.hasOwnProperty(id) && reg.test(id)) {
                let settings = this.settings[id];
                if (!settings || _objects) {
                    this.settings[id] = Utils.getSettings(objects[id], {user: this.props.user, language: this.props.language}, true);
                    settings = this.settings[id];
                }

                if (settings.enabled === false && !editMode) {
                    continue;
                }
                let parts = id.split('.');
                parts.splice(rootParts.length + 1);
                id = parts.join('.');
                if (!items.find(e => e.id === id)) {
                    items.push({id, settings});
                }
            }
        }
        return items;
    }

    static isOpened(path, id) {
        if (id === path.substring(0, id.length)) return true;
        return undefined;
    }

    onToggleEnabled(e, id) {
        e && e.stopPropagation();
        const visibility = {};
        for (const id in this.state.visibility) {
            if (this.state.visibility.hasOwnProperty(id)) {
                visibility[id] = this.state.visibility[id];
            }
        }
        visibility[id] = !visibility[id];
        let settings = this.settings[id];
        settings.enabled = visibility[id];
        this.props.onSaveSettings(id, settings);
        this.setState({visibility});
    }

    getListItems(items) {
        if (!items) {
            items = this.getElementsToShow();
        } else
        if (typeof items !== 'object') {
            items = this.getElementsToShow(items);
        }
        const icons = items.map(e => Utils.getIcon(e.settings, Theme.menuIcon));
        const anyIcons = !!icons.find(icon => icon);

        return items.map(function (item, i) {
            const icon = icons[i];
            const children = this.getListItems(item.id);

            if (!this.props.editMode && !this.settings[item.id].enabled) return;

            const visibilityButton = this.props.editMode ? <VisibilityButton
                big={true}
                visible={this.state.visibility[item.id]}
                onChange={() => this.onToggleEnabled(null, item.id)}/> : null;

            return [(<ListItem
                    style={{opacity: this.props.editMode && !this.state.visibility[item.id] ? 0.5 : 1}}
                    button
                    className={this.props.selectedId === item.id ? 'selected' : ''}
                    key={item.id}
                    onClick={el => this.onSelected(item.id, el)}
                >
                    {icon ? (<ListItemIcon>{icon}</ListItemIcon>) : (anyIcons ? (<div style={{width: Theme.menuIcon.height + 1}}>&nbsp;</div>) : null)}
                    <ListItemText primary={item.settings.name}/>
                    {visibilityButton}
                    {children && children.length ? (MenuList.isOpened(this.props.selectedId, item.id) ? <ExpandLess /> : <ExpandMore />) : ''}
                </ListItem>),
                children && children.length ? (<Collapse key={'sub_' + item.id} in={MenuList.isOpened(this.props.selectedId, item.id)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {children}
                    </List>
                </Collapse>) : null
            ]
        }.bind(this));
    }

    onSelected(id, el) {
        if (this.props.objects[id]) {
            this.props.onSelectedItemChanged && this.props.onSelectedItemChanged(id);
        }
    }

    getSelectedItem(items) {
        if (this.props.selectedId) {
            return this.props.selectedId;
        }
        items = items || this.getElementsToShow();
        return items[0].id || '';
    }

    render() {
        let items = this.getElementsToShow();

        if (items && items.length) {
            return (
                <div style={{width: this.props.width}}>
                    <Divider />
                    {this.getListHeader()}
                    <List>
                        {this.getListItems(items)}
                    </List>
                </div>
            );
        } else {
            return (
                <div style={{width: this.props.width}}>
                    <Divider />
                    {this.getListHeader()}
                    <Divider />
                    <List>
                        <ListItem key="0" value="0">
                            <ListItemText>{I18n.t('No elements')}</ListItemText>
                        </ListItem>
                    </List>
                </div>
            );
        }
    }
}

export default MenuList;