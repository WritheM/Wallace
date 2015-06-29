function PluginConfig(conf, name) {
    this.conf = conf;
    this.name = name;

    //for old code compatibility
    //TODO: REMOVE!
    if (this.conf.has(this.name)) {
        var pconf = this.conf.get(this.name);
        for (key in pconf) {
            var val = pconf[key];

            this[key] = val;
        }
    }
}

PluginConfig.prototype.has = function (path) {
    return this.conf.has(this.name + "." + path);
};

PluginConfig.prototype.get = function (path) {
    return this.conf.get(this.name + "." + path);
};

PluginConfig.prototype.set = function (path, value) {
    return this.conf.set(this.name + "." + path, value);
};

module.exports = PluginConfig;