let PlugPlaylist = require("./PlugPlaylist.js");

/**
 * @module Plug
 */

/**
 * @class PlugPlaylists
 */
export default class PlugPlaylists {
    /**
     * @class PlugPlaylists
     * @constructor
     * @param plugin
     */
    constructor(plugin) {
        this.plugin = plugin;
        this.plug = plugin.plug;

        this.playlists = [];

        this.plug.getPlaylists((function (err, playlists) {
            for (let i in playlists) {
                if (!playlists.hasOwnProperty(i)) {
                    continue;
                }
                let playlist = playlists[i];
                this.playlists.push(new PlugPlaylist(this.plugin, playlist));
            }
        }).bind(this));
    }

    /**
     * @method list
     * @returns {Array}
     */
    list() {
        return this.playlists;
    }

    /**
     * @method add
     * @param playlist
     * @param callback
     */
    add(playlist, callback) {
        playlist.plugin = this.plugin;
        /*this.plug.addPlaylist(playlist.name, (function(details) {
         if (callback != undefined);
         }).bind(this));*/

        //add playlist, with media
        //https://github.com/SooYou/plugged/blob/master/plugged.js#L1486-L1489
        this.plug.query.query("POST", this.plug.endpoints["PLAYLISTS"], {
                name: playlist.name,
                media: playlist.media
            },
            (function (err, data) {
                if (!err) {
                    let details = data[0];
                    playlist.name = details.name;
                    playlist.active = details.active;
                    playlist.id = details.id;

                    this.playlists.append(playlist);
                }
                if (callback) {
                    callback(err, data);
                }
            }).bind(this),
            true);
    }

    /**
     * @method remove
     * @param playlist
     * @param callback
     */
    remove(playlist, callback) {
        this.plug.deletePlaylist(playlist.id, function (err, data) {
            if (!err) {
                playlist.plug = undefined;
                playlist.active = false;
                playlist.id = -1;

                let index = this.playlists.indexOf(playlist);
                if (index > -1) {
                    this.playlists.splice(index, 1);
                }
            }
            if (callback) {
                callback(err, data);
            }
        });
    }
}