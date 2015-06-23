var plugin;
var manager;
var plug;

var events = {};

events.onLoad = function (_plugin) {
    plugin = _plugin;
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
};

// http://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
var randmsg = ["Destination network unreachable", "Destination host unreachable", "Destination host unknown"];

events.command_ping = function (message) {
    var rand = Math.floor(Math.random() * 10);

    var response = "pong!";

    if (rand == 0) {
        response = randmsg[Math.floor(Math.random() * randmsg.length)];
    }

    //plug.sendChat("[@" + message.from.username + "] " + response);
    message.from.sendReply(response);
};

module.exports = {
    "events": events
};