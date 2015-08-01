var fs = require("fs");
var PluginLoader = require("./PluginLoader");

class PluginManager {
    constructor(_core) {
        this.paths = [];
        this.plugins = [];
        this.pluginnames = {};
        this.loaded = [];

        // this.config = _config;
        this.core = _core;
        this.config = _core.config; // temporary
    }

    start() {
        for (var i = 0; i < this.config.core.paths.length; i++) {
            var path = this.config.core.paths[i];
            this.addPath(path);
        }

        this.scanPlugins();

        for (var n = 0; n < this.config.core.plugins.length; n++) {
            var plugin = this.config.core.plugins[n];

            var inst = this.getPluginLoader(plugin);
            if (inst) {
                inst.load();
            }
        }
    }

    addPath(path) {
        this.paths.push(path);
    }

    scanPlugins() {
        var newplugins = [];
        var plugin = null;

        // iterate directories and scan meta.json files (use PluginLoader method)
        for (var n = 0; n < this.paths.length; n++) {
            var dir = this.paths[n];
            var files = fs.readdirSync(dir);
            for (var j = 0; j < files.length; j++) {
                var file = dir + "/" + files[j];
                if (fs.lstatSync(file).isDirectory()) {
                    plugin = this.getPluginByPath(file);
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
                            plugin = new PluginLoader(this, file);
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
            plugin = this.plugins[i];
            if (newplugins.indexOf(plugin) === -1) {
                console.info(plugin.meta.name + " no longer exists, unload");
                plugin.unload();
            }
        }

        this.plugins = newplugins;

    }

    // temporary until a proper config system is in place
    getConfig() {
        return this.core.loadConfig();
    }

    getPluginLoader(pluginName) {
        pluginName = pluginName.toLowerCase();
        for (var i = 0; i < this.plugins.length; i++) {
            var plugin = this.plugins[i];
            if (plugin.meta.name.toLowerCase() === pluginName) {
                return plugin;
            }
        }
    }

    getPlugin(pluginName) {
        var plugin = this.getPluginLoader(pluginName);
        if (!plugin || !plugin.loaded) {
            return undefined;
        }
        return plugin.plugin;
    }

    getPluginByPath(path) {
        for (var i = 0; i < this.plugins.length; i++) {
            var plugin = this.plugins[i];
            if (plugin.directory === path) {
                return plugin;
            }
        }
    }

    fireEvent() {
        for (var i = 0; i < this.plugins.length; i++) {
            var plugin = this.plugins[i];
            if (plugin.loaded) {
                plugin.fireEvent.apply(plugin, arguments);
            }
        }
    }

    getDependencies(plugin, missing) {
        var plugins = [plugin];
        missing = missing || [];

        for (var i = 0; i < plugins.length; i++) {
            plugin = plugins[i];
            if (!plugin.meta.wallace || !plugin.meta.wallace.dependencies) {
                continue;
            }

            //for (var j in plugin.meta.dependencies) {
            for (var j = 0; j < plugin.meta.wallace.dependencies.length; j++) {
                var dependency = plugin.meta.wallace.dependencies[j];
                var cplugin = this.getPluginLoader(dependency);
                if (cplugin) {
                    if (plugins.indexOf(cplugin) === -1) {
                        plugins.push(cplugin);
                    }
                }
                else {
                    missing.push(dependency);
                }
            }
        }
        return plugins.reverse();
    }

    getDependants(plugin) {
        var dependants = [];
        for (var i = 0; i < this.plugins.length; i++) {
            var cplugin = this.plugins[i];
            var dependencies = this.getDependencies(cplugin);
            if (dependencies.indexOf(plugin) !== -1) {
                dependants.push(cplugin);
            }
        }
        return dependants;
    }

    filterLoaded(plugins) {
        var out = [];
        for (var i = 0; i < plugins.length; i++) {
            var cplugin = plugins[i];
            if (cplugin.loaded) {
                out.push(cplugin);
            }
        }
        return out;
    }
}

module.exports = PluginManager;