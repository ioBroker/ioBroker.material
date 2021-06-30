/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
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
import Theme            from '../theme';

import {TiCogOutline as IconWorking}      from 'react-icons/ti';
import {MdPermScanWifi as IconUnreach}      from 'react-icons/md';
import {MdPriorityHigh as IconMaintain}     from 'react-icons/md';
import {MdBatteryAlert as IconLowbat}       from 'react-icons/md';
import {MdError as IconError}        from 'react-icons/md';
import {ChannelDetector} from 'iobroker.type-detector';

const additionalParameters = {
    'WORKING':      {icon: IconWorking,    color: Theme.tile.tileIndicatorsIcons.working},
    'UNREACH':      {icon: IconUnreach,    color: Theme.tile.tileIndicatorsIcons.unreach},
    'LOWBAT':       {icon: IconLowbat,     color: Theme.tile.tileIndicatorsIcons.lowbat},
    'MAINTAIN':     {icon: IconMaintain,   color: Theme.tile.tileIndicatorsIcons.maintain},
    'ERROR':        {icon: IconError,      color: Theme.tile.tileIndicatorsIcons.error},
    'DIRECTION':    {                      color: Theme.tile.tileIndicatorsIcons.direction},
    'CONNECTED':    {icon: IconUnreach,    color: Theme.tile.tileIndicatorsIcons.connected},
};

class IOBChannelDetector {
    constructor() {
        this.detector = new ChannelDetector();
    }

    detect(/*objects, keys, id, usedIds, ignoreIndicators*/) {
        const result = this.detector.detect.apply(this.detector, arguments);

        result && result.forEach(one =>
            one.states.forEach(state =>
                state.id && additionalParameters[state.name] && Object.assign(state, additionalParameters[state.name])));

        return result;
    }
}

export default IOBChannelDetector;
