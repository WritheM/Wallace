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

module.exports = {
    "events" : events
};