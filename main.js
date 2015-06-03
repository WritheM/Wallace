var PluginManager = require("./core/PluginManager.js");

plugman = new PluginManager();
plugman.addPath("coreplugins");
plugman.addPath("plugins");

plugman.scanPlugins();

for (var i = 0; i < plugman.plugins.length; i++) {
    var plugin = plugman.plugins[i];
    // console.log(plugin.meta.name);
}

var plug = plugman.getPlugin("plug");
plug.load();

var slack = plugman.getPlugin("slack");
slack.load();

//var callouts = plugman.GetPlugin("callouts");
//callouts.Load();
