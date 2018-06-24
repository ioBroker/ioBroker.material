class Utils {
    static CapitalWords(name) {
        return name.split(/[\s_]/)
            .filter(item => item)
            .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
            .join(' ');
    }

    static getObjectName(objects, id, isDesc) {
        let item = objects[id];
        let text = id;
        const attr = isDesc ? 'desc' : 'name';

        if (item && item.common && item.common[attr]) {
            text = item.common[attr];
            if (attr !== 'desc' && !text && item.common.desc) {
                text = item.common.desc;
            }
            if (typeof text === 'object') {
                const lang = (objects['system.config'] && objects['system.config'].common && objects['system.config'].common.language) || 'en';
                text = text[lang] || text.en;
            }
            text = text.replace(/[_.]/g, ' ');

            if (text === text.toUpperCase()) {
                text = text[0] + text.substring(1).toLowerCase();
            }
        } else {
            let pos = id.lastIndexOf('.');
            text = id.substring(pos + 1).replace(/[_.]/g, ' ');
            text = Utils.CapitalWords(text);
        }
        return text.trim();
    }

    static getSettings(obj, options, defaultEnabling) {
        if (typeof options === 'boolean') {
            defaultEnabling = options;
            options = null;
        }
        let settings;
        if (obj && obj.common && obj.common.custom) {
            settings = obj.common.custom || {};
            settings = settings.material ? JSON.parse(JSON.stringify(settings.material)) : {enabled: true};
        } else {
            settings = {enabled: defaultEnabling === undefined ? true : defaultEnabling};
        }
        return settings;
    }
    static setSettings(obj, settings, options) {
        if (obj) {
            obj.common = obj.common || {};
            obj.common.custom = obj.common.custom || {};
            obj.common.custom.material = settings;
            return true;
        } else {
            return false;
        }
    }
}

export default Utils;