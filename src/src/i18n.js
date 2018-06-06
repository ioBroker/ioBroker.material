// import React, { Component } from 'react';
//import I18n from 'react-native-i18n'

class I18n {
    static translations = {
        'en': require('./i18n/en'),
        'ru': require('./i18n/ru'),
        'de': require('./i18n/de'),
    };

    static lang = 'en';

    static setLanguage(lang) {
        if (lang) I18n.lang = lang;
    }
    static getLanguage() {
        return I18n.lang;
    }
    static t(word) {
        if (I18n.translations[I18n.lang]) {
            const w = I18n.translations[I18n.lang][word];
            if (w) {
                return w;
            } else {
                console.log(`Translate: "${word}"`);
                return word;
            }
        } else {
            return word;
        }
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