var PluginInstance = require(__core + "PluginInstance.js");

var admin = new PluginInstance();

admin.init = function() {
    this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method

    admin.loadDir(__dirname+"/cmds");
};

module.exports = admin;