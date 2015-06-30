var PlugAPI = require("plugapi");
var PlugUser = require("./PlugUser.js");

var PluginInstance = require(__core + "PluginInstance.js");
var plugin = new PluginInstance();


plugin.eventproxy = {};

plugin.init = function () {
    this.plug = new PlugAPI({
        email: this.config.auth.email,
        password: this.config.auth.password
    });

    this.plug.multiLine = true;
    this.plug.multiLineLimit = 5;

    this.plug.connect(this.config.auth.room);

    //plug.on("roomJoin", eventproxy.roomJoin);

    for (var i = 0; i < PlugAPI.events.length; i++) {
        var event = PlugAPI.events[i];
        if (!(event in this.eventproxy) && event !== "command") {
            // javascript closure abuse: -
            // goal is to have "event" defined and to also pass that into the event
            // function

            this.plug.on(event, function (event) {
                return function (arg) {
                    plugin.eventproxy.generic(event, arg);
                };
            }(event));
        }
        else {
            this.plug.on(event, this.eventproxy[event]);
        }
    }


    //plugAPI has a bug, raw command event double fires
    // bind specific command event also and filter out plain within func
    this.plug.on("command:*", this.eventproxy["command"]);
};

plugin.eventproxy.generic = function (event, arg) {
    //console.log("generic", event, arg);
    console.log("Event", event, arg);
    plugin.manager.fireEvent("plug_" + event, arg);
};

plugin.eventproxy.roomJoin = function (room) {
    console.log("Joined " + room);

    plugin.manager.fireEvent("plug_roomJoin", room);
};

plugin.eventproxy.chat = function (message) {
    //var user = new PlugUser(message.from);
    message.from = new PlugUser(message.from, plugin.plug);

    plugin.manager.fireEvent("plug_chat", message);
    plugin.manager.fireEvent("chat", message);
};

plugin.eventproxy.command = function (message) {
    if (this.event.indexOf(":") === -1) {
        return;
    }

    message.from = new PlugUser(message.from, plugin.plug);

    plugin.manager.fireEvent("plug_command_" + message.command, message);
    plugin.manager.fireEvent("command_" + message.command, message);
};


plugin.events.plug_chat = function (message) {
    console.log("PlugChat: [@" + message.from.username + "] ", message.message);
};

module.exports = plugin;
