var PluginInstance = require(__core + "PluginInstance.js");

var basicBot = new PluginInstance();

var plugAPI = require("plugapi");

basicBot.init = function() {
    this.plugged = this.manager.getPlugin("plug").plug; //TODO: implement better method
    this.plug = this.manager.getPlugin("plug");
};

basicBot.loadDir(__dirname+"/cmds");

module.exports = basicBot;