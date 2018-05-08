const words = {
    SET_TEMPERATURE: {
        "en": "Set temperature",
        "de": "Solltemperatur",
        "ru": "Желаемая температура",
        "pt": "Configure a temperatura",
        "nl": "Stel temperatuur in",
        "fr": "Régler la température",
        "it": "Imposta la temperatura",
        "es": "Temperatura establecida",
        "pl": "Ustaw temperaturę"
    }
};

class Translate {
    static _(text, lang) {
        if (words[text]) {
            return words[text][lang] || words[text].en;
        } else {
            text = text.replace(/_/g, ' ');
            return text[0].toUpperCase() + text.substring(1).toLowerCase();
        }
    }
}

export default Translate;