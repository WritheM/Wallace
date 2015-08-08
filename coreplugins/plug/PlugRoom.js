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

        function chunkify(text, limit) {
            var chunks = [];
            var symbols = {
                "<": 4, // &lt;
                ">": 4, // &gt;
                "&": 5, // &amp;
                "\"": 5, //no idea wtf plug does, should be 6..
                "'": 5 //no idea here either, should be 6 also..
            };
            var start = 0;
            var length = 0;
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                var l = symbols[char] || 1;
                //console.log(length, l);
                if (length + l > limit) {
                    var chunk = text.substring(start, i);
                    chunks.push(chunk);
                    start = i;
                    length = 0;
                }
                length += l;
            }
            if (start < text.length) {
                var chunk = text.substring(start, text.length);
                chunks.push(chunk);
            }
            return chunks;
        }

        let lines = message.split("\n");
        let parts = [];
        for(let i in lines) {
            parts = parts.concat(chunkify(lines[i], 250 - prefix.length));
        }

        for(let i in parts) {
            if (!parts.hasOwnProperty(i)) {
                continue;
            }
            if (options.maxmsg && i >= options.maxmsg) {
                break;
            }

            let part = parts[i];

            this.plug.sendChat(prefix+part);
        }
        this.plugin.manager.fireEvent("plug_sendchat", message, options);
    }
}
module.exports = PlugRoom;