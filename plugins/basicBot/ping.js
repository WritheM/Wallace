var PluginInstance = require(__core + "PluginInstance.js");

var basicBot = new PluginInstance();

// http://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
basicBot.randmsg = ["Destination network unreachable", "Destination host unreachable", "Destination host unknown"];

basicBot.events.command_ping = function (message) {
    var rand = Math.floor(Math.random() * 10);

    var response = "pong!";

    if (rand == 0) {
        response = this.randmsg[Math.floor(Math.random() * randmsg.length)];
    }
    
    message.from.sendReply(response);
};

module.exports = basicBot;