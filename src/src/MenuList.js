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
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';

import Utils from './Utils';
import I18n from './i18n'
import VisibilityButton from './basic-controls/react-visibility-button/VisibilityButton';
import Theme from './theme';

import IconRooms from './icons/IconHome';
import IconButton    from '@material-ui/core/IconButton';
import {MdLightbulbOutline as IconFunctions} from 'react-icons/md';
import {MdFavorite as IconFavorites} from 'react-icons/md';
import {MdExpandLess as ExpandLess} from 'react-icons/md';
import {MdExpandMore as ExpandMore} from 'react-icons/md';
import {MdPlayArrow as IconInstances} from 'react-icons/md';

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
    menuSelectedBright: {
        color: '#1c8fe0 !important'
    },
    menuSelectedDark: {
        color: '#3cc1ff !important'
    },
    menuTextBright: {
        color: 'white !important'
    },
    menuTextDark: {
        color: 'black !important'
    }
};
const myStyles = () => (styles);

class MenuList extends Component {
    static propTypes = {
        classes:        PropTypes.object.isRequired,
        objects:        PropTypes.object.isRequired,
        viewEnum:       PropTypes.string,
        editMode:       PropTypes.bool.isRequired,
        user:           PropTypes.string.isRequired,
        root:           PropTypes.string.isRequired,
        background:     PropTypes.string,
        debug:          PropTypes.bool,
        onSelectedItemChanged: PropTypes.func.isRequired,
        onRootChanged:  PropTypes.func.isRequired,
        instances:      PropTypes.bool // show instances menu
    };

    constructor(props) {
        super(props);
        this.settings = {};

        const {enums, roots} = this.fillEnums(this.props.objects);
        this.enums = enums;

        this.state = {
            selectedIndex:  this.props.defaultValue,
            editMode:       this.props.editMode,
            background:     this.props.background,
            instances:      this.props.instances,
            root:           this.props.root,
            roots:          roots,
            visibility:     {}
        };
        this.state.visibility = this.fillVisibility(this.props.root, this.props.objects, this.props.editMode).visibility;
    }

    fillEnums(objects) {
        objects = objects || this.props.objects;
        let enums     = [];
        let reg       = new RegExp('^enum\\.');

        const ids = Object.keys(objects);
        ids.sort();
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] < 'enum.') continue;
            if (ids[i] > 'enum.\u9999') break;
            if (reg.test(ids[i])) {
                // detect missing steps of enums: e.g. there is enum.rooms.EG.wc, but no enum.rooms.EG;
                const parts = ids[i].split('.');
                let index = enums.length;
                while (parts.length > 2) {
                    parts.pop();
                    const parentId = parts.join('.');
                    if (enums.indexOf(parentId) === -1) {
                        enums.splice(index, 0, parentId);
                    }
                }

                enums.push(ids[i]);
            }
        }

        const roots = {};
        for (let e = enums.length - 1; e >= 0 ; e--) {
            const parts = enums[e].split('.');
            parts.pop();
            if (parts.length > 2) {
                const id = parts.join('.');
                if (roots[id] === undefined) {
                    roots[id] = {
                        expanded: (typeof localStorage !== 'undefined' && localStorage.getItem(id) === '1'),
                        tiles: objects[id] && objects[id].common && objects[id].common.members && objects[id].common.members.length
                    };

                    if (this.props.viewEnum && this.props.viewEnum.substring(0, id.length) === id) {
                        roots[id].expanded = true;
                    }
                }
            }
        }

        enums.sort();
        return {enums, roots};
    }

    fillVisibility(root, objects, editMode) {
        objects = objects || this.props.objects;
        editMode = (editMode === undefined) ? this.props.editMode : editMode;

        // first take elements of enum
        let items = this.getElementsToShow('enum', objects, editMode);
        let changed = false;
        const visibility = {};

        items.forEach(function (e) {
            visibility[e.id] = !(e.settings.enabled === false);
            if (this.state && this.state.visibility[e.id] !== visibility[e.id]) {
                changed = true;
            }
        }.bind(this));

        if (root !== 'enum') {
            items = this.getElementsToShow(root, objects, editMode);

            items.forEach(function (e) {
                visibility[e.id] = !(e.settings.enabled === false);
                if (this.state && this.state.visibility[e.id] !== visibility[e.id]) {
                    changed = true;
                }
            }.bind(this));
        }

        return {changed, visibility};
    }

    componentWillReceiveProps(nextProps) {
        const newState = {};
        let wasChanged = false;
        if (nextProps.editMode !== this.state.editMode) {
            newState.editMode = nextProps.editMode;
            wasChanged = true;
        }
        if (nextProps.background !== this.state.background) {
            newState.background = nextProps.background;
            wasChanged = true;
        }
        if (nextProps.instances !== this.state.instances) {
            newState.instances = nextProps.instances;
            wasChanged = true;
        }
        if (nextProps.root !== this.state.root) {
            newState.root = nextProps.root;
            newState.visibility = this.fillVisibility(nextProps.root, nextProps.objects, nextProps.editMode).visibility;
            wasChanged = true;
        }
        if (nextProps.objects) {
            const {enums, roots} = this.fillEnums(this.props.objects);
            this.enums = enums;
            const {changed, visibility} = this.fillVisibility(nextProps.root, nextProps.objects, nextProps.editMode);

            if (changed || JSON.stringify(roots) !== this.state.roots) {
                wasChanged = true;
                newState.roots = roots;
                newState.visibility = visibility;
            }
        }
        if (wasChanged) {
            this.setState(newState);
        }
    }

    getListHeader(useBright) {
        let items = this.getElementsToShow('enum');

        if (items && items.length) {
            return (<ListSubheader style={{background: this.state.background || 'white', borderBottom: useBright ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'}}>{
                items.map(function (item) {
                    let settings = this.settings[item.id];

                    if (!settings || this.props.objects) {
                        this.settings[item.id] = Utils.getSettings(this.props.objects[item.id], {user: this.props.user, language: this.props.language, id: item.id}, true);
                        settings = this.settings[item.id];
                    }

                    if (settings.enabled === false && !this.props.editMode) {
                        return;
                    }

                    const name = settings.name;
                    const visibilityButton = this.props.editMode ? <VisibilityButton useBright={useBright} visible={this.state.visibility[item.id]} onChange={() => this.onToggleEnabled(null, item.id)}/> : null;
                    let style = {};
                    if (this.props.editMode && !this.state.visibility[item.id]) {
                        style = Object.assign({}, style, {opacity: 0.5});
                    }

                    if (item.id === 'enum.rooms') {
                        return (<IconButton
                                    key={item.id}
                                    className={item.id === this.props.root ? this.props.classes.iconsSelected : this.props.classes.icons}
                                    style={style}
                                    tooltip={name}
                                    onClick={() => this.onRootChanged('enum.rooms')}>
                                        <IconRooms name="rooms" width={Theme.iconSize} height={Theme.iconSize} isOn={item.id === this.props.root}/>
                                {visibilityButton}
                        </IconButton>);
                    } else if (item.id === 'enum.functions') {
                        return (<IconButton
                            key={item.id}
                            className={item.id === this.props.root ? this.props.classes.iconsSelected : this.props.classes.icons}
                            style={style}
                            tooltip={name}
                            onClick={() => this.onRootChanged('enum.functions')}>
                            <IconFunctions width={Theme.iconSize} height={Theme.iconSize}/>
                            {visibilityButton}
                        </IconButton>);
                    } else if (item.id === 'enum.favorites') {
                        return (<IconButton
                            key={item.id}
                            className={item.id === this.props.root ? this.props.classes.iconsSelected : this.props.classes.icons}
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
                            className={item.id === this.props.root ? this.props.classes.iconsSelected : this.props.classes.icons}
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
        this.props.onRootChanged && this.props.onRootChanged(id, page && page.id, true);
    }

    getElementsToShow(root, _objects, editMode) {
        root = root || this.props.root;

        // special case: instances
        if (root === Utils.INSTANCES) {
            root = 'enum.rooms';
        }

        editMode = (editMode === undefined) ? this.props.editMode : editMode;

        let objects = _objects || this.props.objects;
        let items     = [];
        let reg       = root ? new RegExp('^' + root + '\\.') : new RegExp('^[^.]$');
        let rootParts = root.split('.');

        for (let i = 0; i < this.enums.length; i++) {
            let id = this.enums[i];
            if (reg.test(id) &&
                ((objects[id] && objects[id].common && objects[id].common.members && objects[id].common.members.length) || this.state.roots[id])) {
                let settings = this.settings[id];
                // if no settings or properties were changed
                if (!settings || _objects) { // here "_objects" and not objects
                    this.settings[id] = Utils.getSettings(objects[id], {user: this.props.user, language: this.props.language, id}, true);
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
        if (!settings) {
            this.settings[id] = Utils.getSettings(this.props.objects[id], {user: this.props.user, language: this.props.language, id}, true);
            settings = this.settings[id];
        }

        settings.enabled = visibility[id];
        this.props.onSaveSettings(id, settings);
        this.setState({visibility});
    }

    getListItems(items, level) {
        level = level || 0;

        if (!items) {
            items = this.getElementsToShow();
        } else
        if (typeof items !== 'object') {
            items = this.getElementsToShow(items);
        }

        const icons = items.map(e => Utils.getIcon(e.settings, Theme.menuIcon));
        const anyIcons = !!icons.find(icon => icon);

        const useBright = Utils.isUseBright(this.state.background, false);

        return items.map(function (item, i) {
            const icon = icons[i];
            const children = this.getListItems(item.id, level + 1);

            if (!this.settings[item.id]) {
                this.settings[item.id] = Utils.getSettings(this.props.objects[item.id], {user: this.props.user, language: this.props.language, id: item.id}, true);
            }

            if (!this.props.editMode && !this.settings[item.id].enabled) return;

            const visibilityButton = this.props.editMode ? <VisibilityButton
                big={true}
                visible={this.state.visibility[item.id]}
                useBright={useBright}
                onChange={() => this.onToggleEnabled(null, item.id)}/> : null;

            const style = {opacity: this.props.editMode && !this.state.visibility[item.id] ? 0.5 : 1};
            style.marginLeft = 16 * level;
            style.width = 'calc(100% - ' + (16 * level) + 'px)';
            const expanded = this.state.roots[item.id] && this.state.roots[item.id].expanded;
            const styleButton = useBright ? styles.menuTextBright : styles.menuTextDark;

            return [
                (<ListItem
                    style={style}
                    button
                    className={this.props.viewEnum === item.id ? 'menu-selected' : ''}
                    key={item.id}
                    onClick={el => this.onSelected(item.id, el)}
                >
                    {icon ? (<ListItemIcon>{icon}</ListItemIcon>) : (anyIcons ? (<div style={{width: Theme.menuIcon.height + 1}}>&nbsp;</div>) : null)}
                    <ListItemText classes={{
                        primary: this.props.viewEnum === item.id ? (useBright ? this.props.classes.menuSelectedBright : this.props.classes.menuSelectedDark) : (useBright ? this.props.classes.menuTextBright : this.props.classes.menuTextDark)
                    }}
                        primary={item.settings.name}/>
                    {visibilityButton}
                    {children && children.length ? (expanded ?
                        (<ExpandLess style={styleButton} onClick={e => this.onExpandMenu(e, item.id)} />) :
                        (<ExpandMore style={styleButton} onClick={e => this.onExpandMenu(e, item.id)} />)) : ''}
                </ListItem>),

                children && children.length ?
                    (<Collapse key={'sub_' + item.id} in={expanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {children}
                        </List>
                    </Collapse>) : null
            ]
        }.bind(this));
    }

    expandMenu(id, expanded) {
        const roots = JSON.parse(JSON.stringify(this.state.roots));
        roots[id].expanded = expanded;
        this.setState({roots});
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(id, expanded ? '1' : '0');
        }
    }

    onSelected(id, el) {
        if (this.state.roots[id] && !this.state.roots[id].tiles) {
            this.expandMenu(id, !this.state.roots[id].expanded);
        } else if (this.state.roots[id] && this.state.roots[id].tiles) {
            this.props.onSelectedItemChanged && this.props.onSelectedItemChanged(id);
        } else
        if (this.props.objects[id] || id === Utils.INSTANCES) {
            this.props.onSelectedItemChanged && this.props.onSelectedItemChanged(id);
        }
    }

    onExpandMenu(e, id) {
        e.preventDefault();
        e.stopPropagation();

        this.expandMenu(id, !this.state.roots[id].expanded);
    }

    getSelectedItem(items) {
        if (this.props.viewEnum) {
            return this.props.viewEnum;
        }
        items = items || this.getElementsToShow();
        return items[0].id || '';
    }

    render() {
        let items = this.getElementsToShow();

        const style = {width: this.props.width};
        const useBright = Utils.isUseBright(this.state.background, false);
        if (this.state.background) {
            style.background = this.state.background;
        }
        const dividerStyle = useBright ? {backgroundColor: 'rgba(255,255,255,0.12)'} : {};
        if (items && items.length) {
            const list = this.getListItems(items);
            if (this.state.instances && (this.props.root === 'enum.rooms' || this.props.root === Utils.INSTANCES)) {
                list.push((<ListItem
                    button
                    key={Utils.INSTANCES}
                    onClick={el => this.onSelected(Utils.INSTANCES, el)}
                >
                    <ListItemIcon>
                        <IconInstances style={Object.assign({}, Theme.menuIcon, {color: '#008000'})}/>
                    </ListItemIcon>
                    <ListItemText classes={{
                        primary: this.props.viewEnum === Utils.INSTANCES ? (useBright ? this.props.classes.menuSelectedBright : this.props.classes.menuSelectedDark) : (useBright ? this.props.classes.menuTextBright : this.props.classes.menuTextDark)
                    }} primary={I18n.t('Instances')}/>
                </ListItem>));
            }

            return (
                <div style={style}>
                    <Divider className='divider' style={dividerStyle}/>
                    {this.getListHeader(useBright)}
                    <List style={this.state.background ? {background: this.state.background} : {}}>{list}</List>
                </div>
            );
        } else {
            return (
                <div style={style} >
                    <Divider className='divider' style={dividerStyle}/>
                    {this.getListHeader(useBright)}
                    <Divider className='divider' style={dividerStyle}/>
                    <List >
                        <ListItem key="0" value="0">
                            <ListItemText>{I18n.t('No elements')}</ListItemText>
                        </ListItem>
                    </List>
                </div>
            );
        }
    }
}
export default withStyles(myStyles)(MenuList);
