import React, { Component } from 'react';
//import I18n from 'react-native-i18n'

class I18n {
    translations = {
        'en': require('./i18n/en'),
        'ru': require('./i18n/ru'),
        'de': require('./i18n/de'),
    };
    static t (word) {
        return word;
    }
}

/*I18n.translations = {
    'en': require('./i18n/en'),
    'ru': require('./i18n/ru'),
    'de': require('./i18n/de'),
};
I18n.fallbacks = true;
I18n.t = function () {};*/

export default I18n;