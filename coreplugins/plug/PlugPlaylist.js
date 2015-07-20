function PlugPlaylist(plugin, details) {
    this.plugin = plugin;
    this.plug = plugin.plug;

    this.list = undefined;

    this.name = details.name;
    this.active = details.active;
    this.count = details.count;
    this.id = details.id;
}

PlugPlaylist.prototype.list = function(callback) {
    if (this.list !== undefined) {
        callback(this.list);
        return this.list;
    }

    if (this.id > -1) {
        this.plug.getPlaylist(this.id, (function(err, data) {
            if (!err) {
                this.list = data;
            }
        }).bind(this));
    }
};

PlugPlaylist.prototype.addMedia = function(media) {
    var addMedia = function(media) {
        this.list.append(media);
    };
    if (this.id == -1) {
        addMedia(media);
    }
    else {
        this.plug.addMedia(media.id, function(err, data) {
            if (!err) {
                media.id = data.id;
                addMedia(media);
            }
        }.bind(this));
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

//done after a play
PlugPlaylist.prototype.rotate = function() {
    var first = this.list.shift();
    this.list.push(first);
};

module.exports = PlugPlaylist;