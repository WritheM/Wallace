var fs = require('fs');
var PluginInfo = require("./PluginInfo");

function PluginManager(_core) {
    this.paths = [];
    this.plugins = []
    this.pluginnames = {};
    this.loaded = [];

    // this.config = _config;
    this.core = _core;
    this.config = _core.config; // temporary
}

PluginManager.prototype.start = function() {
    for (var i = 0; i < this.config.core.paths.length; i++) {
        var path = this.config.core.paths[i];
        this.addPath(path);
    }

    this.scanPlugins();

    for (var i = 0; i < this.config.core.plugins.length; i++) {
        var plugin = this.config.core.plugins[i];

        var inst = this.getPlugin(plugin);
        if (inst)
            inst.load();
    }
}

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
        if (newplugins.indexOf(plugin) == -1) {
            console.log(plugin.meta.name + " no longer exists, unload");
            plugin.unload();
        }
    }

    this.plugins = newplugins;

};

// temporary until a proper config system is in place
PluginManager.prototype.getConfig = function() {
    return this.core.loadConfig();
}

PluginManager.prototype.getPlugin = function(pluginName) {
    pluginName = pluginName.toLowerCase(); 
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.meta.name.toLowerCase() == pluginName) { return plugin; }
    }
};

PluginManager.prototype.getPluginByPath = function(path) {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.directory == path) { return plugin; }
    }
}

PluginManager.prototype.fireEvent = function() {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.loaded) {
            plugin.fireEvent.apply(plugin, arguments);
        }
    }
}

PluginManager.prototype.getDependencies = function(plugin, missing) {
    var plugins = [ plugin ];
    missing = missing || [];

    for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        if (!plugin.meta.dependencies)
            continue;

        for ( var j in plugin.meta.dependencies) {
            var dependency = plugin.meta.dependencies[j];
            var cplugin = this.getPlugin(dependency);
            if (cplugin) {
                if (plugins.indexOf(cplugin) == -1)
                    plugins.push(cplugin);
            }
            else
                missing.push(dependency);
        }
    }
    return plugins.reverse();
}

PluginManager.prototype.getDependants = function(plugin) {
    var dependants = [];
    for (var i = 0; i < this.plugins.length; i++) {
        var cplugin = this.plugins[i];
        var dependencies = this.getDependencies(cplugin);
        if (dependencies.indexOf(plugin) != -1)
            dependants.push(cplugin);
    }
    return dependants;
}

PluginManager.prototype.filterLoaded = function(plugins) {
    var out = [];
    for (var i = 0; i < plugins.length; i++) {
        var cplugin = plugins[i];
        if (cplugin.loaded)
            out.push(cplugin);
    }
    return out;
}

module.exports = PluginManager;