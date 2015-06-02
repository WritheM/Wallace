var Plugins = require("./core/plugins.js");

plugman = new Plugins.PluginManager();
plugman.AddPath("coreplugins");
plugman.AddPath("plugins");

plugman.ScanPlugins();

for (var i = 0; i < plugman.plugins.length; i++) {
    var plugin = plugman.plugins[i];
    // console.log(plugin.meta.name);
}

var plug = plugman.GetPlugin("plug");
plug.Load();

var slack = plugman.GetPlugin("slack");
slack.Load();
