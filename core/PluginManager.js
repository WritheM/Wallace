let fs = require("fs");
let PluginLoader = require("./PluginLoader");

/**
 * @module Wallace
 */

/**
 * @class PluginManager
 */
export default class PluginManager {
    /**
     * @constructor
     * @class PluginManager
     * @method constructor
     * @param _core
     */
    constructor(_core) {
        this.paths = [];
        this.plugins = [];
        this.pluginnames = {};
        this.loaded = [];

        // this.config = _config;
        this.core = _core;
        this.config = _core.config; // temporary
    }

    /**
     * @method start
     */
    start() {
        for (let i = 0; i < this.config.core.paths.length; i++) {
            let path = this.config.core.paths[i];
            this.addPath(path);
        }

        this.scanPlugins();

        for (let n = 0; n < this.config.core.plugins.length; n++) {
            let plugin = this.config.core.plugins[n];

            let inst = this.getPluginLoader(plugin);
            if (inst) {
                inst.load();
            }
        }
    }

    /**
     * @method addPath
     * @param {string} path
     */
    addPath(path) {
        this.paths.push(path);
    }

    /**
     * @method scanPlugins
     */
    scanPlugins() {
        let newplugins = [];
        let plugin = null;

        // iterate directories and scan meta.json files (use PluginLoader method)
        for (let n = 0; n < this.paths.length; n++) {
            let dir = this.paths[n];
            let files = fs.readdirSync(dir);
            for (let j = 0; j < files.length; j++) {
                let file = dir + "/" + files[j];
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
        for (let i = 0; i < this.plugins.length; i++) {
            plugin = this.plugins[i];
            if (newplugins.indexOf(plugin) === -1) {
                console.info(plugin.meta.name + " no longer exists, unload");
                plugin.unload();
            }
        }

        this.plugins = newplugins;

    }

    /**
     * @method getConfig
     * @return {*}
     */
    // temporary until a proper config system is in place
    getConfig() {
        return this.core.loadConfig();
    }

    /**
     * @method getPluginLoader
     * @param {String} pluginName
     * @return {PluginLoader}
     */
    getPluginLoader(pluginName) {
        pluginName = pluginName.toLowerCase();
        for (let i = 0; i < this.plugins.length; i++) {
            let plugin = this.plugins[i];
            if (plugin.meta.name.toLowerCase() === pluginName) {
                return plugin;
            }
        }
    }

    /**
     * @method getPlugin
     * @param {String} pluginName
     * @return {PluginInstance}
     */
    getPlugin(pluginName) {
        let plugin = this.getPluginLoader(pluginName);
        if (!plugin || !plugin.loaded) {
            return undefined;
        }
        return plugin.plugin;
    }

    /**
     * @method getPluginByPath
     * @param path
     * @return PluginLoader
     */
    getPluginByPath(path) {
        for (let i = 0; i < this.plugins.length; i++) {
            let plugin = this.plugins[i];
            if (plugin.directory === path) {
                return plugin;
            }
        }
    }

    /**
     * @method fireEvent
     * @param String eventName
     * @param args ...
     */
    fireEvent() {
        for (let i = 0; i < this.plugins.length; i++) {
            let plugin = this.plugins[i];
            if (plugin.loaded) {
                plugin.fireEvent.apply(plugin, arguments);
            }
        }
    }

    /**
     * Recursively looks up dependencies for specified plugin.
     *
     * @method getDependencies
     * @param {PluginLoader} plugin Plugin to look up dependencies for
     * @param {[PluginLoader]} missing List of missing dependencies
     * @return {[PluginLoader]}
     */
    getDependencies(plugin, missing) {
        let plugins = [plugin];
        missing = missing || [];

        for (let i = 0; i < plugins.length; i++) {
            plugin = plugins[i];
            if (!plugin.meta.wallace || !plugin.meta.wallace.dependencies) {
                continue;
            }

            //for (let j in plugin.meta.dependencies) {
            for (let j = 0; j < plugin.meta.wallace.dependencies.length; j++) {
                let dependency = plugin.meta.wallace.dependencies[j];
                let cplugin = this.getPluginLoader(dependency);
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

    /**
     * @method getDependants
     * @param plugin
     * @return [PluginLoader]
     */
    getDependants(plugin) {
        let dependants = [];
        for (let i = 0; i < this.plugins.length; i++) {
            let cplugin = this.plugins[i];
            let dependencies = this.getDependencies(cplugin);
            if (dependencies.indexOf(plugin) !== -1) {
                dependants.push(cplugin);
            }
        }
        return dependants;
    }

    /**
     * @method filterLoaded
     * @param plugins
     * @return {Array}
     */
    filterLoaded(plugins) {
        let out = [];
        for (let i = 0; i < plugins.length; i++) {
            let cplugin = plugins[i];
            if (cplugin.loaded) {
                out.push(cplugin);
            }
        }
        return out;
    }
}