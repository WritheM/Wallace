var PluginInstance = require(__core + "PluginInstance.js");

var playlist = new PluginInstance();

var plugAPI = require("plugapi");

playlist.init = function() {
    this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method
};

var subcommands = {};

playlist.events.command_playlist = function(message) {
    if (message.from.rank >= playlist.core.ranks.MANAGER) {
        var subcommand = message.args[0];
        var func = subcommands.list;
        if (subcommands[subcommand]) {
            func = subcommands[subcommand];
        }
        func(message);
    }
    else {
        message.from.sendReply("Command only available to staff", {emote:true});
    }
};

subcommands.list = function(message) {
    playlist.plug.getPlaylists(function(err, playlists) {
        var list = [];
        for (var i in playlists) {
            if (!playlists.hasOwnProperty(i)) {
                continue;
            }
            var playlist = playlists[i];
            var entry = playlist.id + "("+playlist.name+")";
            if (playlist.active) {
                entry = "*" + entry + "*";
            }
            list.push(entry);
        }
        message.from.sendReply(list.join(", "));
    });
};

subcommands.activate = function(message) {
    playlist.plug.activatePlaylist(message.args[1], function (err, data) {
        if (err) {
            message.from.sendReply("Error: "+err.message);
        }
        else {
            message.from.sendReply("Playlist activated");
        }
    });
};

subcommands["delete"] = function(message) {
    playlist.plug.deletePlaylist(message.args[1], function(err, data) {
        if (err) {
            message.from.sendReply("Error: "+err.message);
        }
        else {
            message.from.sendReply("Playlist deleted");
        }
    });
};

subcommands.add = function(message) {
    playlist.plug.createPlaylist(message.args[1], function(err, data) {
      if (err) {
          message.from.sendReply("Error: "+err.message);
      }
      else {
          message.from.sendReply("Playlist created, ID: "+data[0].id);
      }
  });
};

playlist.events.command_grab = function(message) {
    if (message.from.rank >= playlist.core.ranks.MANAGER) {
        playlist.plug.grab();
    }
    else {
        message.from.sendReply("Command only available to staff", {emote:true});
    }
};

module.exports = playlist;