/* Plugin loader and manager

Features:
 - Dependency management (wut do if cyclic?)

Plans:
 - Update detection, autoreload

Plugins/
  Plugin_Name/
    meta.json   <-- define name, dependencies, maybe what it provides
    config.json <-- configuration, maybe better in main dir
*/

var fs = require('fs');


function PluginManager() {
	this.paths = [];
	this.plugins = []
	this.pluginnames = {};
	this.loaded = [];
}

exports.PluginManager = PluginManager;

PluginManager.prototype.AddPath = function(path) {
	this.paths.push(path);
};

PluginManager.prototype.ScanPlugins = function() {
	//iterate directories and scan meta.json files (use PluginInfo method)
	//TODO: merge with existing list
	for (var i = 0; i < this.paths.length; i++) {
		var dir = this.paths[i];
		var files = fs.readdirSync(dir);
		for (var j = 0; j < files.length; j++) {
			var file = dir + "/" + files[j];
			if (fs.lstatSync(file).isDirectory()) {
				try {
					var plugin = new PluginInfo(this, file);
					this.plugins.push(plugin);
				}
				catch (e) {
					//TODO: print warning to console here
				}
			}
		}
	}
	
};

PluginManager.prototype.GetPlugin = function(pluginName) {
	for (var i = 0; i < this.plugins.length; i++) {
		var plugin = this.plugins[i];
		if (plugin.name == pluginName) {
			return plugin;
		}
	}
};


PluginManager.prototype.Load = function(plugin) {
	//TODO: check if dependencies loaded 
	

	if (!plugin.loaded) {
		plugin._Load();
	}
};

PluginManager.prototype.Unload = function(plugin) {
	plugin._Unload();
};


function PluginInfo(manager, directory) {
	this.manager = manager;
	this.directory = directory;

	this.loaded = false;
	this.events = {};

	//meta
	var file = this.directory + '/meta.json';
	this.meta = JSON.parse(fs.readFileSync(file, "utf8"));
}

PluginInfo.prototype._Load = function() {
	var path = this.directory + '/' + this.meta.script;
	try {
		this.plugin = require(path);

		//if here, plugin loaded successfully

		this.loaded = true;

		this.plugin.events.onLoad()
	}
	catch (e) {
		//TODO: consider removing try/catch, or rethrowing.
	}
};

PluginInfo.prototype._Unload = function() {
	var path = this.directory + '/' + this.meta.script;

	//http://stackoverflow.com/a/6677355
	var name = require.resolve(path);
	delete require.cache[name];
};

PluginInfo.prototype.GetConfig = function() {
	var manconf = this.manager.GetConfig();
	if (this.meta.name in manconf) {
		return this.meta.name; 
	}
	//no existing userconfig, clone it before returning
	return manconf[this.meta.name] = JSON.parse(JSON.stringify(this.meta));
};
