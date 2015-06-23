function PluginCreateInstance(pluginInst) {
    var inst = new PluginInstance();
    inst.prototype = pluginInst;
    return inst;
}

var PluginInstance = function () {
    this.pinst = this;
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

module.exports = PluginInstance;