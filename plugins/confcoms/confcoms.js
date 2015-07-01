var PluginInstance = require(__core + "PluginInstance.js");
var confcoms = new PluginInstance();

function addCommand (command, response) {
    confcoms.events["command_"+command] = function(message) {
        message.from.sendReply(response);
    }
}

confcoms.init = function() {
    for(var command in this.config.commands) {
        if (this.config.commands.hasOwnProperty(command)) {
            addCommand(command, this.config.commands[command]);
        }
    }
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