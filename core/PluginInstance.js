var fs = require("fs");

var events = {};

var PluginInstance = function () {
    this.pinst = this;
    this.files = [];

    this.events = {};
    for(var k in events) {
        this.events[k] = events[k];
    }

    console.log(events, this.events);
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

events.onLoad = function (_plugin) {
    this.plugin = _plugin;
    this.manager = _plugin.manager;
    this.core = this.manager.core;
    this.config = _plugin.getConfig();

    if (this.init) {
        this.init();
    }
};

events.onUnload = function () {
    for (var i in this.files) {
        var name = this.files[i];
        try {
            delete require.cache[name];
        }
        catch (e) {

        }
    }
};

function PluginCreateInstance(pluginInst) {
    var inst = new PluginInstance();
    inst.prototype = pluginInst;
    return inst;
}

module.exports = PluginInstance;