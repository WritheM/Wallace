//var PlugMessage = require("./PlugMessage.js");
var PlugUser = require("./PlugUser.js");
//var PlugMedia = require("./PlugMedia.js");

function PlugRoom(plugin) {
    this.plugin = plugin;
    this.plug = plugin.plug;
}

PlugRoom.prototype.getUsers = function() {
    var _users = this.plug.getUsers();
    var users = [];
    for(var user in _users) {
        if (!_users.hasOwnProperty(user)) {
            continue;
        }
        users.push(new PlugUser(this.plugin, _users[user]));
    }

    return users;
};

//ID -> Id deliberate, match Javascript conventions better
// (i.e. document.getElementById)
PlugRoom.prototype.getUserById = function(id, checkCache) {
    var user = this.plug.getUserByID(id, checkCache);
    if (user) {
        return new PlugUser(this.plugin, user);
    }
    else {
        return undefined;
    }
};

PlugRoom.prototype.getUserByName = function(name, checkCache) {
    var user = this.plug.getUserByName(name, checkCache);
    if (user) {
        return new PlugUser(this.plugin, user);
    }
    else if(name[0] == "@") {
        return this.getUserByName(name.substring(1));
    }
    else {
        return undefined;
    }
};

PlugRoom.prototype.getSelf = function() {
    return new PlugUser(this.plugin, this.plug.getSelf());
};

//TODO: maybe abstract out into own class/container
PlugRoom.prototype.setSetting = function(setting, value, callback) {
    return this.plug.setSetting(setting, value, callback);
};

PlugRoom.prototype.getSetting = function(setting) {
    return this.plug.getSetting(setting);
};

PlugRoom.prototype.getCurrentMedia = function() {
    var media = this.plug.getCurrentMedia();
    if (!media) {
        return undefined;
    }
    return new PlugMedia(this.plugin, media);
};

PlugRoom.prototype.getMessages = function() {

};

PlugRoom.prototype.tokenizeMessage = function(message) {

};

//TODO: implement queue (with message priorities)
PlugRoom.prototype.sendChat = function(message, options) {
    options = options || {};

    var parts = message.split("\n");
    for(var i in parts) {
        var part = parts[i];

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
        if (options.rofl) {
            var state = true;
            part.replace(new RegExp(".{"+options.rofl+"}", "g"), function(str) {
                state = !state;
                if (state) return "\u202E"+str;
                else  return "\u202D"+str;
            });
        }
        if (options.emote) {
            part = "/me " + part;
        }

        this.plug.sendChat(part);
    }
    this.plugin.manager.fireEvent("plug_sendchat", message, options);
};

module.exports = PlugRoom;