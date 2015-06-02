var Plugins = require("./core/plugins.js");

plugman = new Plugins.PluginManager();
plugman.AddPath("coreplugins");
plugman.AddPath("plugins");

plugman.ScanPlugins();

for(var i = 0; i < plugman.plugins.length; i++) {
	var plugin = plugman.plugins[i];
	//console.log(plugin.meta.name);
}

var slack = plugman.GetPlugin("plug");
slack.Load();
