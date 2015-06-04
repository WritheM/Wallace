var plugin;
var manager;
var plug;

var events = {};

events.onLoad = function(_plugin) {
    plugin = _plugin;
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
}

events.plug_command_save = function(message) {
    manager.saveConfig();
}


events.plug_command_plugins = function(message) {
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
        
        plug.sendChat("[@" + message.from.username + "] Loaded: " + loaded.join(", "));
        plug.sendChat("[@" + message.from.username + "] Available: " + unloaded.join(", "));
    }
    else if (message.args[0] == "refresh") {
        manager.scanPlugins();
        plug.sendChat("[@" + message.from.username + "] Plugins rescanned");
    }
    else {
        plug.sendChat("[@" + message.from.username + "] Usage: !plugins list/refresh");
    }
}

events.plug_command_plugin = function(message) {
    var plugin = manager.getPlugin(message.args[1]);
    if (!plugin) {
        plug.sendChat("[@" + message.from.username + "] Error: Couldn't find plugin");
        return;
    }
    
    if (message.args[0] == "info") {
        
    }
    else if (message.args[0] == "load") {
        plugin.load();
        plug.sendChat("[@" + message.from.username + "] Plugin loaded");
    }
    else if (message.args[0] == "unload") {
        plugin.unload();
        plug.sendChat("[@" + message.from.username + "] Plugin unloaded");
    }
    else if (message.args[0] == "reload") {
        plugin.unload();
        plugin.load();
        plug.sendChat("[@" + message.from.username + "] Plugin unloaded");
    }
    else {
        plug.sendChat("[@" + message.from.username + "] Usage: !plugin info/load/unload/reload [plugin Name]");
    }
}


module.exports = {
    "events" : events
};