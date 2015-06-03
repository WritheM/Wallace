var fs = require('fs');

function PluginInfo(manager, directory) {
    this.manager = manager;
    this.directory = directory;

    this.loaded = false;
    this.events = {};

    this.reloadMeta();
}

module.exports = PluginInfo;

PluginInfo.prototype.reloadMeta = function() {
    var file = this.directory + '/meta.json';
    this.meta = JSON.parse(fs.readFileSync(file, "utf8"));
}

PluginInfo.prototype.load = function() {
    // get plugin script path
    var path = '../' + this.directory + '/' + this.meta.script;
    try {
        this.plugin = require(path);

        // if here, plugin loaded successfully

        this.loaded = true;

        this.plugin.events.onLoad(this);
        console.log("Loaded " + this.meta.name);
    }
    catch (e) {
        // TODO: consider removing try/catch, or rethrowing.
        console.log(e);
    }
};

PluginInfo.prototype.unload = function() {
    var path = '../' + this.directory + '/' + this.meta.script;

    // http://stackoverflow.com/a/6677355
    var name = require.resolve(path);
    delete require.cache[name];
};

PluginInfo.prototype.getConfig = function() {
    var manconf = this.manager.getConfig();
    if (this.meta.name in manconf) { return this.meta.name; }
    // no existing userconfig, clone it before returning

    var conf = {}
    if ("config" in this.meta)
        conf = this.meta.config;
    return manconf[this.meta.name] = JSON.parse(JSON.stringify(conf));
};

PluginInfo.prototype.fireEvent = function(eventname, args) {
    if (!this.loaded) { return; }
    if (!(eventname in this.plugin.events)) { return; }
    this.plugin.events[eventname](args);
}