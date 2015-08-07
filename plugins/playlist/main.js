var PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

var plugAPI = require("plugapi"); //TODO: remove

export default class Playlist extends PluginInstance {
    init () {
        this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method
        this.subcommands = new SubCommands(this);
    }

    @EventHandler()
    command_playlist(message) {
        if (message.from.rank >= this.core.ranks.MANAGER) {
            var subcommand = message.args[0];
            var func = this.subcommands.list;
            if (this.subcommands[subcommand]) {
                func = this.subcommands[subcommand];
            }
            func.call(this.subcommands, message);
        }
        else {
            message.from.sendReply("Command only available to staff", {emote: true});
        }
    }

    @EventHandler()
    command_grab(message) {
        if (message.from.rank >= this.core.ranks.MANAGER) {
            this.plug.grab(parseInt(message.args[0]));
        }
        else {
            message.from.sendReply("Command only available to staff", {emote: true});
        }
    }
}

class SubCommands {
    constructor(plugin) {
        this.playlist = plugin;
    }

    list(message) {
        this.playlist.plug.getPlaylists(function(err, playlists) {
            var list = [];
            for (var i in playlists) {
                if (!playlists.hasOwnProperty(i)) {
                    continue;
                }
                let playlist = playlists[i];
                var entry = playlist.id + "("+playlist.name+")";
                if (playlist.active) {
                    entry = "*" + entry + "*";
                }
                list.push(entry);
            }
            message.from.sendReply(list.join(", "));
        });
    }

    activate(message) {
        this.playlist.plug.activatePlaylist(message.args[1], function (err, data) {
            if (err) {
                message.from.sendReply("Error: "+err.message);
            }
            else {
                message.from.sendReply("Playlist activated");
            }
        });
    }

    ["delete"](message) {
        this.playlist.plug.deletePlaylist(message.args[1], function(err, data) {
            if (err) {
                message.from.sendReply("Error: "+err.message);
            }
            else {
                message.from.sendReply("Playlist deleted");
            }
        });
    }

    add(message) {
        this.playlist.plug.createPlaylist(message.args[1], function(err, data) {
          if (err) {
              message.from.sendReply("Error: "+err.message);
          }
          else {
              message.from.sendReply("Playlist created, ID: "+data[0].id);
          }
      });
    }
}