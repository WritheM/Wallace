var PluginInstance = require(__core + "PluginInstance.js");
var confcoms = new PluginInstance();

function addCommand (command, response) {
    var func = "command_" + command;
    confcoms.events[func] = function() {
        message.from.sendReply(response);
    }
}

confcoms.init = function(message) {
    console.log(this.config.commands);
/*
    for(var i = 0;this.config.commands.length <= i;i++) {
        //TODO: this is not a functional function that functions yet.
        console.log(this.config.commands[i]);
        addCommand(this.config.commands[i], this.config.commands[i]);
    }*/
}

confcoms.events.command_about = function (message) {
    console.log(GLOBAL.PLUGIN_CONTRIBUTORS);
    var contributors = "";
    if (GLOBAL.PLUGIN_CONTRIBUTORS) {
        contributors = "and running plugins designed by: " + GLOBAL.PLUGIN_CONTRIBUTORS.join(", ");
    }
    message.from.sendReply("I am running botPlug v"+GLOBAL.BOTPLUGVERSION+" created by Michael Writhe and Joe Carter, which is open source and available at http://github.com/writhem/botPlug "+ contributors);
};

module.exports = confcoms;