var fs = require('fs');
var PluginInfo = require("./PluginInfo");

function PluginManager() {
    this.paths = [];
    this.plugins = []
    this.pluginnames = {};
    this.loaded = [];
}

module.exports = PluginManager;

PluginManager.prototype.addPath = function(path) {
    this.paths.push(path);
};

PluginManager.prototype.scanPlugins = function() {
    var newplugins = [];

    // iterate directories and scan meta.json files (use PluginInfo method)
    for (var i = 0; i < this.paths.length; i++) {
        var dir = this.paths[i];
        var files = fs.readdirSync(dir);
        for (var j = 0; j < files.length; j++) {
            var file = dir + "/" + files[j];
            if (fs.lstatSync(file).isDirectory()) {

                var plugin = this.getPluginByPath(file);
                if (plugin != null) {
                    try {
                        plugin.reloadMeta(plugin);

                        newplugins.push(plugin);
                    }
                    catch (e) {
                        // maybe a bit harsh, but unload plugin..
                        plugin.unload();
                    }
                }
                else {
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
    }

    // unload plugins that no-longer exist.
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (!(plugin in newplugins)) {
            plugin.unload();
        }
    }

    this.plugins = newplugins;

};

PluginManager.prototype.getPlugin = function(pluginName) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.meta.name == pluginName) { return plugin; }
    }
};

PluginManager.prototype.getPluginByPath = function(path) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.directory == path) { return plugin; }
    }
}

PluginManager.prototype.getConfig = function() {
    return {}; // TODO: make file based w/ persistence
}

PluginManager.prototype.fireEvent = function(event, args) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.loaded) {
            plugin.fireEvent(event, args);
        }
    }
}