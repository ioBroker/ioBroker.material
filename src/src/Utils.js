class Utils {
    static CapitalWords(name) {
        return name.split(/[\s_]/)
            .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
            .filter(item => item)
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
}

export default Utils;