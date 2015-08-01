var fs = require("fs");

function PluginLoader(manager, directory) {
    this.manager = manager;
    this.directory = directory;

    this.loaded = false;
    this.events = {};

    this.reloadMeta();
}

PluginLoader.prototype.reloadMeta = function () {
    var file = this.directory + "/package.json";
    this.meta = JSON.parse(fs.readFileSync(file, "utf8"));
};

PluginLoader.prototype._load = function () {
    if (this.loaded) {
        return true;
    }

    // get plugin script path
    var path = "../" + this.directory + "/";
    try {
        var plugin = require(path);

        if (typeof (plugin) === "function") {
            this.plugin = plugin(this);
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

PluginLoader.prototype._unload = function () {
    var path = "../" + this.directory + "/";

    this.fireEvent("onUnload");

    this.loaded = false;
    this.plugin = undefined;

    try {
        // http://stackoverflow.com/a/6677355
        var name = require.resolve(path);
        delete require.cache[name];
    }
    catch (e) {

    }
};

PluginLoader.prototype.load = function () {
    var deps = this.manager.getDependencies(this);
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep._load();
    }
};

PluginLoader.prototype.unload = function () {
    var deps = this.manager.filterLoaded(this.manager.getDependants(this));
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep._unload();
    }
    this._unload();
};

PluginLoader.prototype.reload = function () {
    var deps = this.manager.filterLoaded(this.manager.getDependants(this));

    this.unload();
    this.load();

    //reload everything that got unloaded (as they were depending on this)
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep.load();
    }
};

PluginLoader.prototype.getConfig = function () {
    var manconf = this.manager.getConfig();
    if (this.meta.name in manconf) {
        return manconf[this.meta.name];
    }
    // no existing userconfig, clone it before returning

    var conf = {};
    if ("wallace" in this.meta && "config" in this.meta.wallace) {
        conf = this.meta.wallace.config;
    }
    manconf[this.meta.name] = JSON.parse(JSON.stringify(conf));
    return [this.meta.name];
};

PluginLoader.prototype.fireEvent = function (eventname) {
    if (!this.loaded) {
        return;
    }
    if (!(eventname in this.plugin.events)) {
        return;
    }
    try {
        var args = Array.prototype.slice.call(arguments);
        args.shift();

        this.plugin.events[eventname].apply(this.plugin, args);
    }
    catch (e) {
        console.log("Event handler crashed", e);
    }
};

PluginLoader.prototype.addAuthor = function(author) {
    if (author instanceof Array) {
        author.forEach(function(auth) {
            PluginLoader.prototype.addAuthor(auth);
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

module.exports = PluginLoader;