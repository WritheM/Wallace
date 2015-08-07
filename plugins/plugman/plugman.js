let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

export default class Plugman extends PluginInstance {
    @EventHandler()
    command_save(message) {
        this.manager.core.saveConfig();
    }

    @EventHandler()
    command_plugins(message) {
        if (message.from.rank >= manager.core.ranks.MANAGER) {
            if (message.args.length <= 0 || message.args[0] === "list") {
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
            else if (message.args[0] === "refresh") {
                manager.scanPlugins();
                message.from.sendReply("Plugins rescanned");
            }
            else {
                message.from.sendReply("Usage: !plugins list/refresh");
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote: true});
        }
    }

    @EventHandler()
    command_plugin(message) {
        if (message.from.rank >= manager.core.ranks.MANAGER) {
            var plugin = manager.getPluginLoader(message.args[1]);
            if (["info", "load", "unload", "reload"].indexOf(message.args[0]) !== -1) {
                if (!plugin) {
                    message.from.sendReply("Error: Could not find plugin");
                    return;
                }
            }

            if (message.args[0] === "info") {

            }
            else if (message.args[0] === "load") {
                plugin.load();
                message.from.sendReply("Plugin loaded");
            }
            else if (message.args[0] === "unload") {
                plugin.unload();
                message.from.sendReply("Plugin unloaded");
            }
            else if (message.args[0] === "reload") {
                plugin.reload();
                message.from.sendReply("Plugin reloaded");
            }
            else {
                message.from.sendReply("Usage: !plugin info/load/unload/reload [plugin Name]");
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote: true});
        }
    }

    @EventHandler()
    command_deps(message) {
        console.log(manager.getDependencies(message.args[0]));
    }

}