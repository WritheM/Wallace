var PluginManager = require("./core/PluginManager.js");

plugman = new PluginManager();
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

//var callouts = plugman.GetPlugin("callouts");
//callouts.Load();
