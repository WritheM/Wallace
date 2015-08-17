let Plugged = require("plugged");
let FileCookieStore = require('tough-cookie-filestore');
let tough = require("tough-cookie");
let cookie = require("request/lib/cookies");
let fs = require("fs");

let PlugUser = require("./PlugUser.js");
let PlugRoom = require("./PlugRoom.js");
let PlugPlaylists = require("./PlugPlaylists.js");
let PlugMessage = require("./PlugMessage.js");

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
            plugged.sendChat("/me Wallace v" + WALLACEVERSION + " online");
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

    chat(messageData) {
        let message = new PlugMessage(this.plugin, messageData);

        let commandPrefix = "!";
        if (messageData.message[0] === commandPrefix) {
            let end = messageData.message.indexOf(" ");
            if (end == -1) { //no space
                end = messageData.message.length;
            }

            let command = messageData.message.substring(1, end);
            messageData.message = messageData.message.substring(end+1);
            
            let commandMessage = new PlugMessage(this.plugin, messageData);
            commandMessage.command = command;

            this.plugin.manager.fireEvent("plug_command_" + commandMessage.command, commandMessage);
            this.plugin.manager.fireEvent("command_" + commandMessage.command, commandMessage);
        }

        this.plugin.manager.fireEvent("plug_chat", message);
        this.plugin.manager.fireEvent("chat", message);
    }
}

module.exports = Plugin;
