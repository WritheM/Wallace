var plugin;
var events = {};

var plug;
var config;

var PlugUser = require("./PlugUser.js");

events.onLoad = function (_plugin) {
    plugin = _plugin;
    config = plugin.getConfig();

    var PlugAPI = require('plugapi');

    plug = new PlugAPI({
        email: config.auth.email,
        password: config.auth.password
    });

    plug.multiLine = true;
    plug.multiLineLimit = 5;

    plug.connect(config.auth.room);

    //plug.on('roomJoin', eventproxy.roomJoin);

    for (var i in PlugAPI.events) {
        var event = PlugAPI.events[i];
        if (!(event in eventproxy) && event !== "command") {
            // javascript closure abuse: -
            // goal is to have "event" defined and to also pass that into the event
            // function

            plug.on(event, function (event) {
                return function (arg) {
                    eventproxy.generic(event, arg);
                };
            }(event));
        }
        else {
            plug.on(event, eventproxy[event]);
        }
    }


    //plugAPI has a bug, raw command event double fires
    // bind specific command event also and filter out plain within func
    plug.on("command:*", eventproxy["command"]);

    module.exports.plug = plug;
};

var eventproxy = {};

eventproxy.generic = function (event, arg) {
    //console.log("generic", event, arg);
    console.log("Event", event, arg);
    plugin.manager.fireEvent("plug_" + event, arg);
};

eventproxy.roomJoin = function (room) {
    console.log("Joined " + room);

    plugin.manager.fireEvent("plug_roomJoin", room);
};

eventproxy.chat = function (message) {
    //var user = new PlugUser(message.from);
    message.from = new PlugUser(message.from, plug);

    plugin.manager.fireEvent("plug_chat", message);
    plugin.manager.fireEvent("chat", message);
};

eventproxy.command = function (message) {
    if (this.event.indexOf(":") === -1) {
        return;
    }

    message.from = new PlugUser(message.from, plug);

    plugin.manager.fireEvent("plug_command_" + message.command, message);
    plugin.manager.fireEvent("command_" + message.command, message);
};


events.plug_chat = function (message) {
    console.log("PlugChat: [@" + message.from.username + "] ", message.message);
};

module.exports = {
    "events": events,
    "plug": plug,
    "PlugUser": PlugUser
};
