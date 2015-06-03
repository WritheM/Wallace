var fs = require('fs');
var PluginInfo = require("./PluginInfo");

function PluginManager() {
    this.paths = [];
    this.plugins = []
    this.pluginnames = {};
    this.loaded = [];
}

module.exports = PluginManager;

PluginManager.prototype.AddPath = function(path) {
    this.paths.push(path);
};

PluginManager.prototype.ScanPlugins = function() {
    var newplugins = [];

    // iterate directories and scan meta.json files (use PluginInfo method)
    for (var i = 0; i < this.paths.length; i++) {
        var dir = this.paths[i];
        var files = fs.readdirSync(dir);
        for (var j = 0; j < files.length; j++) {
            var file = dir + "/" + files[j];
            if (fs.lstatSync(file).isDirectory()) {
                try {
                    var plugin = new PluginInfo(this, file);
                    newplugins.push(plugin);
                }
                catch (e) {
                    // TODO: print warning to console here
                }
            }
        }
    }
    this.plugins = newplugins;

};

PluginManager.prototype.GetPlugin = function(pluginName) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.meta.name == pluginName) { return plugin; }
    }
};

PluginManager.prototype.GetConfig = function() {
    return {}; // TODO: make file based w/ persistence
}

PluginManager.prototype.FireEvent = function(event, args) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.loaded) {
            plugin.FireEvent(event, args);
        }
    }
}