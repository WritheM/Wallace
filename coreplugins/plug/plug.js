let Plugged = require("plugged");
let FileCookieStore = require('tough-cookie-filestore');
let tough = require("tough-cookie");
let cookie = require("request/lib/cookies");
let fs = require("fs");

let PlugUser = require("./PlugUser.js");
let PlugRoom = require("./PlugRoom.js");
let PlugPlaylists = require("./PlugPlaylists.js");

let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");
//let plugin = new PluginInstance();

class Plugin extends PluginInstance {

    init() {
        this.eventproxy = new EventProxy(this);

        this.initPlugged();
    }

    initPlugged() {
        let logger = this.core.log4js.getLogger("plugged");

        let plugged = new Plugged({
            log: logger
        });

        let cookies = "";
        try {
            cookies = JSON.parse(fs.readFileSync("cookiejar.json"));
        }
        catch (e) {

        }

        if (cookies) {
            let jar = tough.CookieJar.deserializeSync(cookies);
            let rjar = cookie.jar();
            rjar._jar = jar;
            plugged.setJar(rjar);
            //tough.CookieJar.deserializeSync(cookies)
        }


        this.relogin = function () {
            plugged.getAuthToken(function (err, token) {
                if (!err) {
                    plugged.login(this.config.auth, token);
                }
                else {
                    plugged.login(this.config.auth);
                }
            }.bind(this));
        }.bind(this);

        this.relogin();

        plugged.on(plugged.LOGIN_SUCCESS, function () {
            plugged.connect(this.config.auth.room);
            let cookies = JSON.stringify(plugged.getJar()._jar.toJSON());
            fs.writeFileSync("cookiejar.json", cookies);
        }.bind(this));
        plugged.on(plugged.CONN_PART, function () {
            this.relogin();
        }.bind(this));
        plugged.on(plugged.SOCK_ERROR, function () {
            this.relogin();
        }.bind(this));
        plugged.on(plugged.CONN_ERROR, function () {
            setTimeout(function () {
                this.relogin();
            }.bind(this), 5000);
        }.bind(this));

        //definite case where a relogin is needed
        plugged.on(plugged.LOGIN_ERROR, function () {
            setTimeout(function () {
                plugged.login(this.config.auth);
            }.bind(this), 5000);
            plugged.setJar(null);
        }.bind(this));

        plugged.on(plugged.JOINED_ROOM, function () {
            //plugged.sendChat("/me Wallace v" + WALLACEVERSION + " online");
            this.room = new PlugRoom(this);
            this.playlists = new PlugPlaylists(this);
        }.bind(this));

        plugged.GRAB_UPDATE = plugged.GRAB;

        plugged.getWaitList = plugged.getWaitlist; //case
        plugged.getDJ = plugged.getCurrentDJ;

        plugged.getMedia = plugged.getCurrentMedia;


        this.plugged = plugged;
        this.plug = plugged; //TEMP

        //monkey patch emit: http://stackoverflow.com/a/18087021
        plugged.emit_old = plugged.emit;
        plugged.emit = function () {
            plugged.emit_old.apply(plugged, arguments);

            let event = arguments[0];

            if (event in this.eventproxy) {
                let args = Array.prototype.slice.call(arguments, 1);
                this.eventproxy[event].apply(this.eventproxy, args);
            }
            else {
                this.eventproxy.generic.apply(this.eventproxy, arguments);
            }
        }.bind(this);
    }

}

class EventProxy {
    constructor(plugin) {
        this.plugin = plugin;
    }

    generic(event, arg) {
        //console.log("generic", event, arg);
        let ignore = ["sockOpen"];
        if (ignore.indexOf(event) === -1) {
            console.debug("Event", event, arg);
        }
        this.plugin.manager.fireEvent("plug_" + event, arg);
    }

    userUpdate(event) {
        var user = this.plugin.plug.getUserByID(event.id);
        if (event.level) {
            user.level = event.level;
        }
        if (event.badge) {
            user.badge = event.badge;
        }
        if (event.avatarID) {
            user.avatarID = event.avatarID;
        }
        if (event.username) {
            user.username = event.username;
        }
        if (event.sub) { // Note: Plugged removes this
            user.sub = event.sub;
        }
        this.plugin.manager.fireEvent("plug_userUpdate", event);
    }

    advance(booth, playback, previous) {
        let event = playback;
        event.currentDJ = this.plugin.plugged.getUserByID(booth.dj);
        event.lastPlay = previous;
        console.debug("Event", "advance", event);
        this.plugin.manager.fireEvent("plug_advance", event);
    }

    parseMessage(message, options) {
        if (!options) {
            options = {};
        }
        options.keepquotes = options.keepquotes || false;
        options.quotes = options.quotes || true;
        options.users = options.users || true;

        function matchName(query, i, users) {
            let matches = [];
            for(let iuser in users) {
                if (!users.hasOwnProperty(iuser)) {
                    continue;
                }
                let user = users[iuser];

                let cmpname = user.username.split(" ").slice(0, i).join(" ");
                if (cmpname === query) {
                    matches.push(user);
                }
            }
            return matches;
        }

        let users = this.plugin.plug.getUsers();

        users.sort(function(a, b) {
            return b.username.length - a.username.length;
        });

        let parts = message.split(" ");
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];

            if (options.quotes && part[0] === "\"") {

                for (let j = 1; j <= 10 && i + j < parts.length; j++) {
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

                let matches = users;
                for (let j = 1; j <= 10 && i + j < parts.length; j++) {
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
    }

    chat(messageData) {
        messageData.from = this.plugin.room.getUserById(messageData.id);
        messageData.delete = function() {
            plugin.plug.deleteMessage(this.cid);
        };
        let commandPrefix = "!";

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
                    return this.plugin.room.getUserByName(this.args[index].substring(1));
                }
            };


            this.plugin.manager.fireEvent("plug_command_" + messageData.command, messageData);
            this.plugin.manager.fireEvent("command_" + messageData.command, messageData);
        }

        this.plugin.manager.fireEvent("plug_chat", messageData);
        this.plugin.manager.fireEvent("chat", messageData);
    }
}

module.exports = Plugin;