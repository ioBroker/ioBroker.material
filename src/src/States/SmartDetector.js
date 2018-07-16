import Theme            from '../theme';

import IconWorking      from 'react-icons/lib/ti/cog-outline';
import IconUnreach      from 'react-icons/lib/md/perm-scan-wifi';
import IconMaintain     from 'react-icons/lib/md/priority-high';
import IconLowbat       from 'react-icons/lib/md/battery-alert';
import IconError        from 'react-icons/lib/md/error';

const additionalParameters = {
    'WORKING':      {icon: IconWorking,    color: Theme.tile.tileIndicatorsIcons.working},
    'UNREACH':      {icon: IconUnreach,    color: Theme.tile.tileIndicatorsIcons.unreach},
    'LOWBAT':       {icon: IconLowbat,     color: Theme.tile.tileIndicatorsIcons.lowbat},
    'MAINTAIN':     {icon: IconMaintain,   color: Theme.tile.tileIndicatorsIcons.maintain},
    'ERROR':        {icon: IconError,      color: Theme.tile.tileIndicatorsIcons.error},
    'DIRECTION':    {                      color: Theme.tile.tileIndicatorsIcons.direction},
};

class IOBChannelDetector {
    constructor() {
        this.detector = new window.ChannelDetector();
    }

    detect(/*objects, keys, id, usedIds, ignoreIndicators*/) {
        const result = this.detector.detect.apply(this.detector, arguments);

        if (result) {
            result.forEach(one => {
                one.states.forEach(state => {
                    if (state.id && additionalParameters[state.name]) {
                        Object.assign(state, additionalParameters[state.name]);
                    }
                });
            })
        }

        return result;
    }
}

export default IOBChannelDetector;