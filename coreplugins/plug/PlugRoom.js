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

        let prefix = "";
        if (options.rtl) {
            prefix += "\u202E";
        }
        if (options.emote) {
            prefix += "/me ";
        }

        function splitSubstring(str, len) {
            var ret = [ ];
            for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
                ret.push(str.substring(offset, offset + len));
            }
            return ret;
        }

        let lines = message.split("\n");
        let parts = [];
        for(let i in lines) {
            parts = parts.concat(splitSubstring(lines[i], 245 - prefix.length));
        }

        for(let i in parts) {
            if (!parts.hasOwnProperty(i)) {
                continue;
            }

            let part = parts[i];

            this.plug.sendChat(prefix+part);
        }
        this.plugin.manager.fireEvent("plug_sendchat", message, options);
    }
}
module.exports = PlugRoom;