//let PlugMessage = require("./PlugMessage.js");
let PlugUser = require("./PlugUser.js");
//let PlugMedia = require("./PlugMedia.js");

let Entities = require('html-entities').XmlEntities;
let entities = new Entities();

/**
 * @module Plug
 */

/**
 * @class PlugRoom
 */
export default class PlugRoom {
    /**
     * @class PlugRoom
     * @constructor
     * @param plugin
     */
    constructor(plugin) {
        this.plugin = plugin;
        this.plug = plugin.plug;
    }

    /**
     * @method getUsers
     * @returns {Array}
     */
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

    /**
     * @
     *
     * @method getUserById
     * @param id
     * @param checkCache
     * @returns {*}
     */
    getUserById(id, checkCache) {
        //ID -> Id deliberate, match Javascript conventions better
        // (i.e. document.getElementById)
        let user = this.plug.getUserByID(id, checkCache);
        if (user) {
            return new PlugUser(this.plugin, user);
        }
        else {
            return undefined;
        }
    }

    /**
     * @method getUserByName
     * @param name
     * @param checkCache
     * @returns {*}
     */
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

    /**
     * @method getSelf
     * @returns {PlugUser|exports|module.exports}
     */
    getSelf() {
        return new PlugUser(this.plugin, this.plug.getSelf());
    }

    /**
     * @method getDJ
     * @returns {*}
     */
    getDJ() {
        return this.getUserById(this.plug.state.room.booth.dj);
    }

    /**
     * @method getBans
     * @param callback
     * @returns {*}
     */
    getBans(callback) {
        //TODO: wrap with class
        return this.plug.getBans(callback);
    }

    /**
     * @method getBan
     * @param username
     * @param callback
     */
    getBan(username, callback) {
        this.getBans((e, bans) => {
            if (e) {
                callback(arguments);
            }
            else {
                for(let i in bans) {
                    let ban = bans[i];
                    //TODO: remove entities decode if plugged fixes issue
                    let banUsername = entities.decode(ban.username).toLowerCase();
                    if (banUsername == username.toLowerCase()) {
                        callback(false, ban);
                        return;
                    }
                }
                callback("User not found");
            }
        });
    }

    /**
     * @method getMedia
     * @returns {*}
     */
    getMedia() {
        let media = this.plug.getCurrentMedia();
        if (!media) {
            return undefined;
        }
        return new PlugMedia(this.plugin, media);
    }

    /**
     * @method getCurrentMedia
     * @deprecated
     */
    getCurrentMedia() {
        return this.getMedia();
    }

    /**
     * @method getMessages
     */
    getMessages() {

    }

    /**
     * @method tokenizeMessage
     * @param message
     */
    tokenizeMessage(message) {

    }

    /**
     * @todo implement queue (with message priorities)
     *
     * @method sendChat
     * @param message
     * @param options
     */
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