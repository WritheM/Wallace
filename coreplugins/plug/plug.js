var Plugged = require("plugged");
var PlugUser = require("./PlugUser.js");
var PlugRoom = require("./PlugRoom.js");
var PlugPlaylists = require("./PlugPlaylists.js");

var PluginInstance = require(__core + "PluginInstance.js");
var plugin = new PluginInstance();

plugin.eventproxy = {};

plugin.init = function () {
    initPlugged();
}

function initPlugged() {
    var that = this;

    var logger = plugin.core.log4js.getLogger("plugged");

    var plugged = new Plugged({
        log: logger
    });

    plugged.login(plugin.config.auth);
    plugged.on(plugged.LOGIN_SUCCESS, function () {
        plugged.connect(plugin.config.auth.room);
    });
    plugged.on(plugged.CONN_PART, function () {
        plugged.login(plugin.config.auth);
    });
    plugged.on(plugged.SOCK_ERROR, function () {
        plugged.login(plugin.config.auth);
    });
    plugged.on(plugged.CONN_ERROR, function () {
        setTimeout(function() {
            plugged.login(plugin.config.auth);
        }, 5000);
    });
    plugged.on(plugged.LOGIN_ERROR, function () {
        setTimeout(function() {
            plugged.login(plugin.config.auth);
        }, 5000);
    });

    plugged.on(plugged.JOINED_ROOM, function () {
        plugged.sendChat("/me Wallace v"+WALLACEVERSION+" online");
        plugin.room = new PlugRoom(plugin);
        plugin.playlists = new PlugPlaylists(plugin);
    });

    //rrdstats fixes
    plugged.getGuests = function() {
        return plugged.state.room.meta.guests;
    };
    plugged.getWaitList = plugged.getWaitlist; //case
    plugged.getDJ = plugged.getCurrentDJ;

    plugged.getMedia = plugged.getCurrentMedia;


    plugin.plugged = plugged;
    plugin.plug = plugged; //TEMP

    //monkey patch emit: http://stackoverflow.com/a/18087021
    plugged.emit_old = plugged.emit;
    plugged.emit = function() {
        var event = arguments[0];

        if (event in plugin.eventproxy) {
            var args = Array.prototype.slice.call(arguments, 1);
            plugin.eventproxy[event].apply(plugin, args);
        }
        else {
            plugin.eventproxy.generic.apply(plugin, arguments);
        }

        plugged.emit_old.apply(plugged, arguments);
    };
};

plugin.eventproxy.generic = function (event, arg) {
    //console.log("generic", event, arg);
    var ignore = ["sockOpen"];
    if (ignore.indexOf(event) == -1) {
        console.debug("Event", event, arg);
    }
    plugin.manager.fireEvent("plug_" + event, arg);
};

plugin.eventproxy.advance = function (booth, playback, previous) {
    var event = playback;
    event.currentDJ = plugin.plugged.getUserByID(booth.dj);
    event.lastPlay = previous;
    console.debug("Event", "advance", event);
    plugin.manager.fireEvent("plug_advance", event);
};

plugin.eventproxy.roomJoin = function (room) {
    console.debug("Joined " + room);

    plugin.manager.fireEvent("plug_roomJoin", room);
};

plugin.eventproxy.chat = function (messageData) {
    messageData.from = new PlugUser(plugin.plugged.getUserByID(messageData.id), plugin.plug);

    //copied and pasted from plugAPI
    //TODO: rewrite with saner approach
    var commandPrefix = "!";
    var i, cmd, lastIndex, allUsers, random;

    if (messageData.message.indexOf(commandPrefix) === 0) {
        cmd = messageData.message.substr(commandPrefix.length).split(' ')[0];
        messageData.command = cmd;
        messageData.args = messageData.message.substr(commandPrefix.length + cmd.length + 1);

        // Mentions => Mention placeholder
        lastIndex = messageData.args.indexOf('@');
        allUsers = plugin.plugged.getUsers();
        random = Math.ceil(Math.random() * 1E10);
        while (lastIndex > -1) {
            var test = messageData.args.substr(lastIndex), found = null;
            for (i in allUsers) {
                if (allUsers.hasOwnProperty(i) && test.indexOf(allUsers[i].username) === 1) {
                    if (found === null || allUsers[i].username.length > found.username.length) {
                        found = allUsers[i];
                    }
                }
            }
            if (found !== null) {
                messageData.args = messageData.args.substr(0, lastIndex) + '%MENTION-' + random + '-' + messageData.mentions.length + '%' + messageData.args.substr(lastIndex + found.username.length + 1);
                messageData.mentions.push(found);
            }
            lastIndex = messageData.args.indexOf('@', lastIndex + 1);
        }

        messageData.args = messageData.args.split(' ');

        // Mention placeholder => User object
        for (i in messageData.mentions) {
            if (messageData.mentions.hasOwnProperty(i)) {
                messageData.args[messageData.args.indexOf('%MENTION-' + random + '-' + i + '%')] = messageData.mentions[i];
            }
        }

        plugin.manager.fireEvent("plug_command_" + messageData.command, messageData);
        plugin.manager.fireEvent("command_" + messageData.command, messageData);
    }

    plugin.manager.fireEvent("plug_chat", messageData);
    plugin.manager.fireEvent("chat", messageData);
};

plugin.eventproxy.command = function (message) {
    if (this.event.indexOf(":") === -1) {
        return;
    }

    message.from = new PlugUser(message.from, plugin.plug);

    plugin.manager.fireEvent("plug_command_" + message.command, message);
    plugin.manager.fireEvent("command_" + message.command, message);
};

module.exports = plugin;