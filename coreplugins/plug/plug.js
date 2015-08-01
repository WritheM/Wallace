var Plugged = require("plugged");
var FileCookieStore = require('tough-cookie-filestore');
var tough = require("tough-cookie");
var cookie = require("request/lib/cookies");
var fs = require("fs");

var PlugUser = require("./PlugUser.js");
var PlugRoom = require("./PlugRoom.js");
var PlugPlaylists = require("./PlugPlaylists.js");

var PluginInstance = require(__core + "PluginInstance.js");
var plugin = new PluginInstance();

plugin.eventproxy = {};

plugin.init = function () {
    initPlugged();
};

function initPlugged() {
    var that = this;

    var logger = plugin.core.log4js.getLogger("plugged");

    var plugged = new Plugged({
        log: logger
    });

    var cookies = "";
    try {
        cookies = JSON.parse(fs.readFileSync("cookiejar.json"));
    }
    catch (e) {

    }

    if (cookies) {
        var jar = tough.CookieJar.deserializeSync(cookies);
        console.log(cookie);
        var rjar = cookie.jar();
        rjar._jar = jar;
        plugged.setJar(rjar);
        //tough.CookieJar.deserializeSync(cookies)
    }

    plugged.getAuthToken(function(err, token) {
        if (!err) {
            plugged.login(plugin.config.auth, token);
        }
        else {
            plugged.login(plugin.config.auth);
        }
    });


    plugged.on(plugged.LOGIN_SUCCESS, function () {
        plugged.connect(plugin.config.auth.room);
        var cookies = JSON.stringify(plugged.getJar()._jar.toJSON());
        fs.writeFileSync("cookiejar.json", cookies);
    });
    plugged.on(plugged.CONN_PART, function () {
        plugged.login(plugin.config.auth);
    });
    plugged.on(plugged.SOCK_ERROR, function () {
        plugged.login(plugin.config.auth);
        plugged.setJar(null);
    });
    plugged.on(plugged.CONN_ERROR, function () {
        setTimeout(function () {
            plugged.login(plugin.config.auth);
        }, 5000);
        plugged.setJar(null);
    });
    plugged.on(plugged.LOGIN_ERROR, function () {
        setTimeout(function () {
            plugged.login(plugin.config.auth);
        }, 5000);
        plugged.setJar(null);
    });

    plugged.on(plugged.JOINED_ROOM, function () {
        plugged.sendChat("/me Wallace v" + WALLACEVERSION + " online");
        plugin.room = new PlugRoom(plugin);
        plugin.playlists = new PlugPlaylists(plugin);
    });

    //rrdstats fixes
    plugged.getGuests = function () {
        return plugged.state.room.meta.guests;
    };
    plugged.getWaitList = plugged.getWaitlist; //case
    plugged.getDJ = plugged.getCurrentDJ;

    plugged.getMedia = plugged.getCurrentMedia;


    plugin.plugged = plugged;
    plugin.plug = plugged; //TEMP

    //monkey patch emit: http://stackoverflow.com/a/18087021
    plugged.emit_old = plugged.emit;
    plugged.emit = function () {
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
    if (ignore.indexOf(event) === -1) {
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


plugin.parseMessage = function (message, options) {
    if (!options) {
        options = {};
    }
    options.keepquotes = options.keepquotes || false;
    options.quotes = options.quotes || true;
    options.users = options.users || true;

    function matchName(query, i, users) {
        var matches = [];
        for(var iuser in users) {
            if (!users.hasOwnProperty(iuser)) {
                continue;
            }
            var user = users[iuser];

            var cmpname = user.username.split(" ").slice(0, i).join(" ");
            if (cmpname === query) {
                matches.push(user);
            }
        }
        return matches;
    }

    var users = this.plug.getUsers();

    users.sort(function(a, b) {sa
        return b.username.length - a.username.length;
    });

    var parts = message.split(" ");
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        if (options.quotes && part[0] === "\"") {

            for (var j = 1; j <= 10 && i + j < parts.length; j++) {
                console.log(part);
                if (part[part.length - 1] === "\"") {

                    parts.splice(i + 1, j - 1);
                    if (options.keepquotes === true) {
                        parts[i] = part;
                    }
                    else {
                        parts[i] = part.substring(1, part.length - 1);
                    }

                    break;
                }
                part = part + " " + parts[i + j];
            }
        }

        else if (options.users && part[0] === "@") {
            part = part.slice(1);

            var matches = users;
            for (var j = 1; j <= 10 && i + j < parts.length; j++) {
                matches = matchName(part, j, matches);

                if (matches.length > 0) {
                    if (matches.length === 1) { //is this the name we're looking for?
                        if (matches[0].username === part) {
                            parts.splice(i + 1, j - 1);
                            parts[i] = "@" + part;
                        }
                    }
                }
                else {
                    break;
                }

                part = part + " " + parts[i + j];
            }

        }
    }
    return parts;
};


plugin.eventproxy.chat = function (messageData) {
    messageData.from = plugin.room.getUserById(messageData.id);
    messageData.delete = function() {
        plugin.plug.deleteMessage(this.cid);
    };
    var commandPrefix = "!";

    //messageData.raw = messageData.message;
    if (messageData.message === "") {
        messageData.args = [];
    }
    else {
        messageData.args = this.parseMessage(messageData.message);
    }

    if (messageData.message[0] === commandPrefix) {
        messageData.command = messageData.command = messageData.args[0].substring(commandPrefix.length);
        messageData.args = messageData.args.slice(1);
        //messageData.message = messageData.message.substring(messageData.message.indexOf(" "));


        messageData.getUser = function(index) {
            if (this.args.length < index) {
                return undefined;
            }
            else if (this.args[index][0] !== "@") {
                return undefined;
            }
            else {
                return plugin.room.getUserByName(this.args[index].substring(1));
            }
        };


        plugin.manager.fireEvent("plug_command_" + messageData.command, messageData);
        plugin.manager.fireEvent("command_" + messageData.command, messageData);
    }

    plugin.manager.fireEvent("plug_chat", messageData);
    plugin.manager.fireEvent("chat", messageData);
};

module.exports = plugin;