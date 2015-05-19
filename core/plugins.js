/* Plugin loader and manager

Features:
 - Dependency management (wut do if cyclic?)

Plans:
 - Update detection, autoreload

PluginManager/
  Plugin_Name/
    meta.json   <-- define name, dependencies, maybe what it provides
    config.json <-- configuration, maybe better in main dir
*/

var fs = require('fs');


function PluginManager(paths) {
	this.paths = paths;
	this.loaded = [];
}

exports.PluginManager = PluginManager;

PluginManager.prototype.AddPath = function(path) {

};

PluginManager.prototype.ListPlugins = function() {
	//iterate directories and scan meta.json files (use PluginInfo method)
};

PluginManager.prototype.GetPlugin = function() {
	//check if loaded
	//if not scan
};

PluginManager.prototype.Load = function(pluginName) {
	//find plugin (use PluginInfo)
	var plugin = this.GetPlugin(pluginName);
	if (!plugin.Loaded()) {
		plugin.Load(); //maybe should be put inline
	}
};

PluginManager.prototype.Unload = function(pluginName) {
};




function PluginInfo(manager, directory) {
	this.manager = manager;
	this.directory = directory;

	this.loaded = false;

	//meta
	var file = this.directory + '/meta.json';
	var meta = JSON.parse(fs.readFileSync(file, "utf8"));
}

PluginInfo.prototype.Load = function() {
	var path = this.directory + '/' + this.meta.script;
	try {
		this.plugin = require(path);

		//if here, plugin loaded successfully

		this.loaded = true;
	}
	catch (e) {

	}
};

PluginInfo.prototypeUnload = function() {
	
};
