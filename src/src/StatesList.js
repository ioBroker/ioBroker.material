import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import Divider from 'material-ui/Divider';
import { Grid, Col } from 'react-flexbox-grid';
import Tile from './Tile';
import TileSmart from './TileSmart';
import CircularProgress from 'material-ui/CircularProgress';
import Utils from './Utils';
import Theme from './theme';
import ChannelDetector from './Channels/Detector';

class StatesList extends Component {

    static propTypes = {
        enumID:  PropTypes.string.isRequired,
        objects: PropTypes.object.isRequired,
        states:  PropTypes.object.isRequired,
        loading: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        this.enumFunctions = null;
        this.detector = new ChannelDetector();
        this.keys = null;
    }

    componentWillUpdate(nextProps, nextState) {
        this.enumFunctions = this.enumFunctions || this.getEnumFunctions(nextProps.objects);
    }

    getElementsToShow() {
        let _enum = this.props.objects[this.props.enumID];

        return _enum && _enum.common ? _enum.common.members || [] : [];
    }

    getEnumFunctions(objects) {
        objects = objects || this.props.objects;
        let result = [];

        for (let id in objects) {
            if (objects.hasOwnProperty(id) &&
                objects[id] &&
                objects[id].common &&
                objects[id].common.members &&
                objects[id].common.members.length &&
                id.match(/^enum\.functions\./)
            ) {
                result.push(id);
            }
        }
        return result;
    }

    createControl(control, channelId, channelInfo) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={channelId}
            id={channelId}
            enumName={Utils.getObjectName(this.props.objects, this.props.enumID)}
            enumFunctions={this.enumFunctions}
            channelInfo={channelInfo}
            states={this.props.states}
            objects={this.props.objects}
            onCollectIds={(element, ids, isMount) => this.props.onCollectIds && this.props.onCollectIds(element, ids, isMount)}
            onControl={(id, val) => this.props.onControl && this.props.onControl(id, val)}
        />);
    }

    getListItems(items) {
        if (!items) {
            items = this.getElementsToShow();
        } else
        if (typeof items !== 'object') {
            items = this.getElementsToShow(items);
        }

        if (!this.keys) {
            this.keys = Object.keys(this.props.objects);
            this.keys.sort();
        }

        const that = this;
        return items.map(id => {
            let detected = that.detector.detect(this.props.objects, this.keys, id);
            if (detected) {
                return that.createControl(TileSmart, id, detected);
            } else {
                let channelInfo = Tile.getChannelInfo(this.props.objects, id);
                if (!channelInfo || (channelInfo.main === undefined && (!channelInfo.states || !channelInfo.states.length))) {
                    return null;
                } else {
                    return this.createControl(Tile, id, channelInfo)
                }
            }
        });
    }

    render() {
        let items = this.getElementsToShow();
        let columns = [];
        if (!this.props.loading && items && items.length) {
            let cols   = 4;
            let xWidth = 3;
            if (this.props.windowWidth < 500) {
                cols = 1;
                xWidth = 12;
            } else if (this.props.windowWidth < 800) {
                cols = 2;
                xWidth = 6;
            } else
            if (this.props.windowWidth < 1200) {
                cols = 3;
                xWidth = 4;
            }
            let rxItems = this.getListItems(items);
            let index = 0;
            for (let i = 0; i < rxItems.length; i++) {
                if (!rxItems[i]) continue;
                columns[index] = columns[index] || [];
                columns[index].push(rxItems[i]);
                index++;
                if (index >= cols) index = 0;
            }
            columns = columns.map((items, i) => <Col key={'col' + i} xs={xWidth} sm={xWidth} md={xWidth} lg={xWidth}>{items}</Col>);
        } else if (this.props.loading) {
            // no connection
            columns.push((<Col xs={12} sm={6} md={4} lg={3} key="connection">
                <CircularProgress size={60} thickness={7} color="#337ab7" style={{padding: 20}}/>
            </Col>));
        } else  {
            // no items
            columns.push((<Col xs={12} sm={6} md={4} lg={3} key="no_items">
                <Tile states={this.props.states} objects={this.props.objects} id=""/>
            </Col>));
        }

        return(
            <div style={Theme.mainPanel}>
                <Grid fluid style={{display: 'flex'}}>{columns}</Grid>
            </div>);
    }
}

export default StatesList;