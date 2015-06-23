var plugin;
var manager;
var plug;

var events = {};

events.onLoad = function (_plugin) {
    plugin = _plugin;
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
};

events.command_save = function (message) {
    manager.core.saveConfig();
};


events.command_plugins = function (message) {
    console.log(message);
    if (message.args[0] == "list") {
        var loaded = [];
        var unloaded = [];

        for (var i = 0; i < manager.plugins.length; i++) {
            var plugin = manager.plugins[i];
            console.log(plugin);
            if (plugin.loaded) {
                loaded.push(plugin.meta.name);
            }
            else {
                unloaded.push(plugin.meta.name);
            }
        }

        message.from.sendReply("Loaded: " + loaded.join(", "));
        message.from.sendReply("Available: " + unloaded.join(", "));
    }
    else if (message.args[0] == "refresh") {
        manager.scanPlugins();
        message.from.sendReply("Plugins rescanned");
    }
    else {
        message.from.sendReply("Usage: !plugins list/refresh");
    }
};

events.command_plugin = function (message) {
    var plugin = manager.getPlugin(message.args[1]);
    if (["info", "load", "unload", "reload"].indexOf(message.args[0]) != -1) {
        if (!plugin) {
            message.from.sendReply("Error: Couldn't find plugin");
            return;
        }
    }

    if (message.args[0] == "info") {

    }
    else if (message.args[0] == "load") {
        plugin.load();
        message.from.sendReply("Plugin loaded");
    }
    else if (message.args[0] == "unload") {
        plugin.unload();
        message.from.sendReply("Plugin unloaded");
    }
    else if (message.args[0] == "reload") {
        plugin.reload();
        message.from.sendReply("Plugin reloaded");
    }
    else {
        message.from.sendReply("Usage: !plugin info/load/unload/reload [plugin Name]");
    }
};

events.plug_command_deps = function (message) {
    console.log(manager.getDependencies(message.args[0]));
};

module.exports = {
    "events": events
};