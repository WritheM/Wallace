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

        function chunkify(text) {
            var chunks = [];
            // 1. lengths are worked out by sending the maximum possible
            // 2. resending what plug given back with regular chars appended
            // 3. removing a char and sending more chars appended
            // difference of the padding chars is then worked out (http://i.imgur.com/zZTSfhQ.png)
            var symbols = {
                        "<": 4, // &lt;
                        ">": 4, // &gt;
                        "&": 5, // &amp;
                        "\"": 5, //&quot (plug seems to do without the ;)
                        "'": 5 //plug encodes as &#34;
                    };
            var start = 0; //where this chunk begins
            var length = 0; //length of chunk
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                var charCode = text.charCodeAt(i);
                
                var l; //char length
                var l2 = 0; // char skip, for multichar chars
                
                if (symbols[char]) {
                    l = symbols[char];
                }
                else if ((charCode & 0x8000) > 0) {
                    //this is a 2 byte char, with a following char
                    // 3-4 byte char (2 UTF16 chars)
                    if (text.length < i+1) {
                        //already truncated, so nothing to join on :/
                        l = 1;
                    }
                    else {
                        if (text.charCodeAt(i+1) > 0xFF) { //next is 2 bytes
                            l = 4;
                        }
                        else { //next is 1 byte
                            l = 3;
                        }
                    	
                    	l2 = 1; //skip 1 char
                    }
                }
                else if (charCode >= 2048) {
                	l = 3;
                }
                else if (charCode >= 0xFF) { //2 byte char
                    l = 2;
                }
                else {
                    l = 1;
                }
               
                //adding this char will bring the message over the length limit
                // so we need to make a new chunk (without char), (next message will start with this char)
                if (length + l > 250) {
                    var chunk = text.substring(start, i);
                    chunks.push(chunk);
                    start = i; //next chunk starts from here
                    length = 0; //and length starts anew (note: we're instantly incrementing)
                }
                
                //now that we've taken care of the splitting, we can add on the char to slice length
                length += l;
                
                
                //multichars char handling..
                // its already accounted for in the length and the following byte can't be wrapped
                // so we increment i (it'll be double incremented by)
                if (l2 > 0) {
                    i += l2;
                }
            }
            
            //this is the following text that didn't need to be wrapped
            // add it as a chunk so that it doesn't get lost
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