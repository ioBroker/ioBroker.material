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
import IconCheck from 'react-icons/lib/md/visibility';
import IconEdit from 'react-icons/lib/md/edit';

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
        root:           PropTypes.string.isRequired,
        onSelectedItemChanged: PropTypes.func.isRequired,
        onRootChanged:  PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex:  this.props.defaultValue,
            editMode:       this.props.editMode
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.editMode !== this.state.editMode) {
            this.setState({editMode: nextProps.editMode});
        }
    }

    getListHeader() {
        let name = Utils.getObjectName(this.props.objects, this.props.root);

        let items = this.getElementsToShow('enum');

        if (name) {
            return (<ListSubheader style={{background: 'white', borderBottom: '1px solid rgba(0, 0, 0, 0.12)'}}>{
                items.map(item => {
                    if (this.props.objects[item] && this.props.objects[item].common && this.props.objects[item].common.name) {
                        name = Utils.getObjectName(this.props.objects, item);
                    } else {
                        name = item.substring(5);
                        name = name[0].toUpperCase() + name.substring(1).toLowerCase();
                    }

                    if (item === 'enum.rooms') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : styles.icons} tooltip={name} onClick={() => this.onRootChanged('enum.rooms')}><IconRooms name="rooms" width={Theme.iconSize} height={Theme.iconSize} isOn={item === this.props.root}/></IconButton>);
                    } else if (item === 'enum.functions') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : styles.icons} tooltip={name} onClick={() => this.onRootChanged('enum.functions')}><IconFunctions width={Theme.iconSize} height={Theme.iconSize}/></IconButton>);
                    } else if (item === 'enum.favorites') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : styles.icons} tooltip={name} onClick={() => this.onRootChanged('enum.favorites')}><IconFavorites width={Theme.iconSize} height={Theme.iconSize}/></IconButton>);
                    } else {
                        return (<Button variant="outlined" key={item} onClick={() => this.onRootChanged(item)}>{name}</Button>);
                    }
                })
            }</ListSubheader>);
        } else {
            return '';
        }
    }

    onRootChanged(id) {
        let items = this.getElementsToShow(id);
        let page = items.find(id => {
            return this.props.objects[id] && this.props.objects[id].common && this.props.objects[id].common.members && this.props.objects[id].common.members.length
        });
        if (!page) {
            let pages = items.map(id => {
                let ids = this.getElementsToShow(id);
                return ids.find(id => {
                    return this.props.objects[id] && this.props.objects[id].common && this.props.objects[id].common.members && this.props.objects[id].common.members.length
                });
            });
            page = pages.find(id => pages[0]);
        }
        this.props.onRootChanged && this.props.onRootChanged(id, page);
    }

    getElementsToShow(root) {
        root = root || this.props.root;

        let objects   = this.props.objects;
        let items     = [];
        let reg       = root ? new RegExp('^' + root + '\\.') : new RegExp('^[^.]$');
        let rootParts = root.split('.');

        for (let id in objects) {
            if (objects.hasOwnProperty(id) && reg.test(id)) {
                let parts = id.split('.');
                parts.splice(rootParts.length + 1);
                id = parts.join('.');
                if (items.indexOf(id) === -1) {
                    items.push(id);
                }
            }
        }
        return items;
    }

    static isOpened(path, id) {
        if (id === path.substring(0, id.length)) return true;
        return undefined;
    }

    onToggleEnabled(id) {

    }

    onEdit(id) {

    }

    getListItems(items) {
        if (!items) {
            items = this.getElementsToShow();
        } else
        if (typeof items !== 'object') {
            items = this.getElementsToShow(items);
        }
        const icons = items.map(id => Utils.getIcon(this.props.objects, id, Theme.menuIcon));
        const anyIcons = !!icons.find(icon => icon);

        return items.map((id, i) => {
            const icon = icons[i];
            const children = this.getListItems(id);
            return [(<ListItem
                    button
                    className={this.props.selectedId === id ? 'selected' : ''}
                    key={id}
                    onClick={el => this.onSelected(id, el)}
                >
                    {icon ? (<ListItemIcon>{icon}</ListItemIcon>) : (anyIcons ? (<div style={{width: Theme.menuIcon.height + 1}}>&nbsp;</div>) : null)}
                    <ListItemText
                        primary={Utils.getObjectName(this.props.objects, id)}
                    />
                    {this.state.editMode ? [
                        (<IconEdit  click={() => this.onEdit(id)}/>),
                        (<IconCheck click={() => this.onToggleEnabled(id)}/>)] : null}
                    {children && children.length ? (MenuList.isOpened(this.props.selectedId, id) ? <ExpandLess /> : <ExpandMore />) : ''}
                </ListItem>),
                children && children.length ? (<Collapse key={'sub_' + id} in={MenuList.isOpened(this.props.selectedId, id)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {children}
                    </List>
                </Collapse>) : null
            ]
        })
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
        return items[0] || '';
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