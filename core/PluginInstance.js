var fs = require('fs');

function PluginCreateInstance(pluginInst) {
    var inst = new PluginInstance();
    inst.prototype = pluginInst;
    return inst;
}

var PluginInstance = function () {
    this.pinst = this;
    this.files = [];
};

PluginInstance.prototype.events = {};

PluginInstance.prototype.events.onLoad = function (_plugin) {
    this.plugin = _plugin;
    this.manager = _plugin.manager;
    this.core = this.manager.core;
    this.config = _plugin.getConfig();

    if (this.init)
        this.init();
};

PluginInstance.prototype.loadDir = function (path) {
    var files = fs.readdirSync(path);
    for (var i in files) {
        var file = path + "/" + files[i];
        var name = require.resolve(file);
        this.files.push(name);

        //small hack, try unloading before loading
        // in case of error/plugin not unloading properly
        try {
            delete require.cache[name];
        }
        catch (e) {

        }

        require(file)(this);
    }
};

PluginInstance.prototype.onUnload = function () {
    for (var i in this.files) {
        var name = this.files[i];
        try {
            delete require.cache[name];
        }
        catch (e) {

        }
    }
};

module.exports = PluginInstance;