let fs = require("fs");

/**
 * @module Wallace
 */

/**
 * Wrapper around plugins, handles the meta information as well as the loading and unloading of them
 *
 * @class PluginLoader
 */
export default class PluginLoader {
    /**
     * @constructor
     * @class PluginLoader
     * @param {PluginManager} manager
     * @param {String} directory
     */
    constructor(manager, directory) {
        this.manager = manager;
        this.directory = directory;

        this.loaded = false;
        this.events = {};

        this.reloadMeta();
    }

    /**
     * reload meta information from the plugins package.json
     *
     * @method reloadMeta
     */
    reloadMeta() {
        let file = this.directory + "/package.json";
        this.meta = JSON.parse(fs.readFileSync(file, "utf8"));
    };


    /**
     * Load plugin (without checking dependencies)
     *
     * @method _load
     * @return {boolean}
     * @private
     */
    _load() {
        if (this.loaded) {
            return true;
        }

        // get plugin script path
        let path = "../" + this.directory + "/";
        try {
            let plugin = require(path);

            if (typeof (plugin) === "function") {
                this.plugin = new plugin(this);
            }
            else {
                this.plugin = plugin;
            }

            // if here, plugin loaded successfully

            this.loaded = true;
            this.addAuthor(this.meta.author);

            this.plugin.events.onLoad.call(this.plugin, this);
            console.log("Loaded " + this.meta.name);
        }
        catch (e) {
            // TODO: consider removing try/catch, or rethrowing.
            console.log(e);
            return false;
        }
    };

    /**
     * Unload plugin (without checking dependencies)
     *
     * @method _unload
     * @private
     */
    _unload() {
        let path = "../" + this.directory + "/";

        this.fireEvent("onUnload");

        this.loaded = false;
        this.plugin = undefined;

        try {
            // http://stackoverflow.com/a/6677355
            let name = require.resolve(path);
            delete require.cache[name];
        }
        catch (e) {

        }
    };

    /**
     * Load plugin (along with dependencies)
     *
     * @method load
     */
    load() {
        let deps = this.manager.getDependencies(this);
        for (let i = 0; i < deps.length; i++) {
            let dep = deps[i];
            dep._load();
        }
    };

    /**
     * Unload plugin (along with dependent plugins)
     *
     * @method unload
     */
    unload() {
        let deps = this.manager.filterLoaded(this.manager.getDependants(this));
        for (let i = 0; i < deps.length; i++) {
            let dep = deps[i];
            dep._unload();
        }
        this._unload();
    };

    /**
     * Reload plugin (along with dependent plugins)
     *
     * @method reload
     */
    reload() {
        let deps = this.manager.filterLoaded(this.manager.getDependants(this));

        this.unload();
        this.load();

        //reload everything that got unloaded (as they were depending on this)
        for (let i = 0; i < deps.length; i++) {
            let dep = deps[i];
            dep.load();
        }
    };

    /**
     * Get config for this plugin (Note: will be changing to global at some point)
     *
     * @method getConfig
     * @return {*}
     */
    getConfig() {
        let manconf = this.manager.getConfig();
        if (this.meta.name in manconf) {
            return manconf[this.meta.name];
        }
        // no existing userconfig, clone it before returning

        let conf = {};
        if ("wallace" in this.meta && "config" in this.meta.wallace) {
            conf = this.meta.wallace.config;
        }
        manconf[this.meta.name] = JSON.parse(JSON.stringify(conf));
        return [this.meta.name];
    };

    /**
     * @method fireEvent
     * @param {String} eventname
     */
    fireEvent(eventname) {
        if (!this.loaded) {
            return;
        }
        if (!(eventname in this.plugin.events)) {
            return;
        }
        try {
            let args = Array.prototype.slice.call(arguments);
            args.shift();

            this.plugin.events[eventname].apply(this.plugin, args);
        }
        catch (e) {
            console.log("Event handler crashed", e);
        }
    };

    /**
     * @method addAuthor
     * @param {String} author
     */
    addAuthor(author) {
        if (author instanceof Array) {
            author.forEach(function (auth) {
                addAuthor(auth);
            });
        }
        else if (typeof author === "string") {
            if (!GLOBAL.PLUGIN_CONTRIBUTORS) {
                GLOBAL.PLUGIN_CONTRIBUTORS = [];
            }
            if (GLOBAL.PLUGIN_CONTRIBUTORS.indexOf(author) === -1) {
                GLOBAL.PLUGIN_CONTRIBUTORS.push(author);
            }
        }
    };
}