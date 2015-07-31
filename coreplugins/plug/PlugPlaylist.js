function PlugPlaylist(plugin, details) {
    this.plugin = plugin;
    this.plug = plugin.plug;

    this.plist = undefined;

    this.name = details.name;
    this.active = details.active;
    this.count = details.count;
    this.id = details.id;
}

PlugPlaylist.prototype.list = function(callback) {
    if (this.plist !== undefined) {
        if (callback) {
            callback(this.plist);
        }
        return this.plist;
    }

    if (this.id > -1) {
        this.plug.getPlaylist(this.id, (function(err, data) {
            if (!err) {
                //this.plist = data;
                this._setPlaylist(data);
                if (callback) {
                    callback(this.plist);
                }
            }
        }).bind(this));
    }
};

PlugPlaylist.prototype._setPlaylist = function(media) {
    this.plist = media; //TODO: use PlugMedia
};

PlugPlaylist.prototype.addMedia = function(media, append, callback) {
    if (this.id == -1) {
        if (append) {
            this.plist = this.plist.concat(media);
        }
        else {
            this.plist = media.concat(this.plist);
        }
        if(callback)  {
            callback(true);
        }
    }
    else {
        this.plug.addMedia(this.id, media, append, (function(err, data) {
            if (!err) {
                media.playlistID = data.id;

                //just invalidate the playlist
                // issue is that we've got no media id
                // if anything cares, they can refetch it via list method
                this.plist = undefined;
                if (callback) {
                    callback(true, data);
                }
            }
            else {
                if (callback) {
                    callback(false, data);
                }
            }
        }).bind(this));
    }
};

PlugPlaylist.prototype.delMedia = function(media) {
    var delMedia = function(media) {
        var index = this.list.indexOf(media);
        if (index > -1) {
            this.list.splice(index, 1);
        }
    };
    if (this.id == -1) {
        delMedia(media);
    }
    else {
        this.plug.deleteMedia(media.id, function(err, data) {
            if (!err) {
                media.id = -1;
                delMedia(media);
            }
        }.bind(this));
    }
};

PlugPlaylist.prototype.shuffle = function(callback) {
    this.plug.shufflePlaylist(this.id, (function(err, data) {
        if (!err) {
            this._setPlaylist(data);
            if (callback) {
                callback(this.plist);
            }
        }
    }).bind(this));
};

//done after a play
PlugPlaylist.prototype._rotate = function() {
    var first = this.list.shift();
    this.list.push(first);
};

module.exports = PlugPlaylist;