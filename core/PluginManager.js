var fs = require('fs');
var PluginInfo = require("./PluginInfo");

function PluginManager() {
    this.paths = [];
    this.plugins = []
    this.pluginnames = {};
    this.loaded = [];

    PluginManager.prototype.getConfig();

    if (this.config.core.logger === undefined) {
        // set some sane defaults
        this.config.core.logger = {
            "appenders" : [ {
                type : "console"
            } ],
            "replaceConsole" : true
        }
    }
    
    var log4js = require("log4js");
    log4js.configure(this.config.core.logger);
    this.logger = log4js.getLogger();

}

module.exports = PluginManager;

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
    this.config = {
        "core" : {
            "paths" : [ "coreplugins", "plugins" ],
            "plugins" : []
        }
    };

    try {
        this.config = JSON.parse(fs.readFileSync("config.json", "utf8"));
    }
    catch (e) {
        console.log(e);
    }

    return this.config;
}

PluginManager.prototype.saveConfig = function() {
    fs.writeFileSync("config.json", JSON.stringify(this.config, null, 4), "utf8");
}

PluginManager.prototype.fireEvent = function() {
    for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.loaded) {
            plugin.fireEvent.apply(plugin, arguments);
        }
    }
}