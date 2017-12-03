class Utils {
    static CapitalWords(name) {
        return name.split(/[\s_]/)
            .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
            .filter(item => item)
            .join(' ');
    }

    static getObjectName(objects, id) {
        let item = objects[id];
        let name = id;
        if (item && item.common && item.common.name) {
            name = item.common.name;
            if (!name && item.common.desc) {
                return item.common.desc;
            }
            name = name.replace(/_/g, ' ');

            if (name === name.toUpperCase()) {
                name = name[0] + name.substring(1).toLowerCase();
            }
        } else {
            let pos = id.lastIndexOf('.');
            name = id.substring(pos + 1).replace(/_/g, ' ');
            name = Utils.CapitalWords(name);
        }
        return name.trim();
    }
}

export default Utils;