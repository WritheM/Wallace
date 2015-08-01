var PlugPlaylist = require("./PlugPlaylist.js");

function PlugPlaylists(plugin) {
    this.plugin = plugin;
    this.plug = plugin.plug;

    this.playlists = [];

    this.plug.getPlaylists((function(err, playlists) {
        for(var i in playlists) {
            if (!playlists.hasOwnProperty(i)) {
                continue;
            }
            var playlist = playlists[i];
            this.playlists.push(new PlugPlaylist(this.plugin, playlist));
        }
    }).bind(this));
}

PlugPlaylists.prototype.list = function() {
    return this.playlists;
};

PlugPlaylists.prototype.add = function(playlist, callback) {
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
        (function(err,data) {
            if (!err) {
                var details = data[0];
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
};

PlugPlaylists.prototype.remove = function(playlist, callback) {
    this.plug.deletePlaylist(playlist.id, function(err, data) {
        if (!err) {
            playlist.plug = undefined;
            playlist.active = false;
            playlist.id = -1;

            var index = this.playlists.indexOf(playlist);
            if (index > -1) {
                this.playlists.splice(index, 1);
            }
        }
        if (callback) {
            callback(err, data);
        }
    });
};

module.exports = PlugPlaylists;