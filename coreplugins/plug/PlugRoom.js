//let PlugMessage = require("./PlugMessage.js");
let PlugUser = require("./PlugUser.js");
//let PlugMedia = require("./PlugMedia.js");

class PlugRoom {
    constructor(plugin) {
        this.plugin = plugin;
        this.plug = plugin.plug;
    }

    getUsers() {
        let _users = this.plug.getUsers();
        let users = [];
        for(let user in _users) {
            if (!_users.hasOwnProperty(user)) {
                continue;
            }
            users.push(new PlugUser(this.plugin, _users[user]));
        }

        return users;
    }

    //ID -> Id deliberate, match Javascript conventions better
    // (i.e. document.getElementById)
    getUserById(id, checkCache) {
        let user = this.plug.getUserByID(id, checkCache);
        if (user) {
            return new PlugUser(this.plugin, user);
        }
        else {
            return undefined;
        }
    }

    getUserByName(name, checkCache) {
        let user = this.plug.getUserByName(name, checkCache);
        if (user) {
            return new PlugUser(this.plugin, user);
        }
        else if(name[0] == "@") {
            return this.getUserByName(name.substring(1));
        }
        else {
            return undefined;
        }
    }

    getSelf() {
        return new PlugUser(this.plugin, this.plug.getSelf());
    }

    //TODO: maybe abstract out into own class/container
    setSetting(setting, value, callback) {
        return this.plug.setSetting(setting, value, callback);
    }

    getSetting(setting) {
        return this.plug.getSetting(setting);
    }

    getCurrentMedia() {
        let media = this.plug.getCurrentMedia();
        if (!media) {
            return undefined;
        }
        return new PlugMedia(this.plugin, media);
    }

    getMessages() {

    }

    tokenizeMessage(message) {

    }

    //TODO: implement queue (with message priorities)
    sendChat(message, options) {
        options = options || {};

        let parts = message.split("\n");
        for(let i in parts) {
            if (!parts.hasOwnProperty(i)) {
                continue;
            }

            let part = parts[i];

            if (options.rtl) {
                part = "\u202E" + part;
            }
            if (options.lol) {
                part = "\u202E" + part.split("").reverse().join("");
                part = part.replace(/[\[\]\{\}\(\)}]/g, function(str) {
                    switch(str) {
                        case "[":
                            return "]";
                        case "]":
                            return "[";
                        case "{":
                            return "}";
                        case "}":
                            return "{";
                        case "(":
                            return ")";
                        case ")":
                            return "(";
                    }
                });
            }
            if (options.emote) {
                part = "/me " + part;
            }

            this.plug.sendChat(part);
        }
        this.plugin.manager.fireEvent("plug_sendchat", message, options);
    }
}
module.exports = PlugRoom;