var PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

var plugAPI = require("plugapi");
var google = require("googleapis");
var youtube = google.youtube("v3");

export default class MediaSkip {
    init(plugin) {
        this.plug = this.manager.getPlugin("plug")
        this.plugged = this.manager.getPlugin("plug").plug; //TODO: implement better method

        //mediaskip.events.plug_advance.call(this, {"media": this.plugged.getMedia()});
        this.plugin.fireEvent("plug_advance", {"media": this.plugged.getMedia()});
    };

    @EventHandler()
    plug_advance(advance) {
        if (!advance.media || !advance.media.cid)
            return;

        if (advance.media.format === 1) {
            youtube.videos.list({
                "part": "contentDetails",
                "id": advance.media.cid,
                "key": this.config.key_youtube
            }, function (err, results) {
                if (results.items.length === 0) {
                    this.plug.room.sendChat("/me [Skipped] Video unavailable");
                    this.plug.skipDJ();
                }
                else {
                    var video = results.items[0];
                    var details = video.contentDetails;
                    if (typeof details.regionRestriction !== "undefined") {
                        var missing = [];
                        if (typeof details.regionRestriction.allowed !== "undefined") {
                            for (var i in this.config.regions) {
                                if (!this.config.regions.hasOwnProperty(i)) {
                                    continue;
                                }
                                var region = this.config.regions[i];
                                if (details.regionRestriction.allowed.indexOf(region) === -1) {
                                    missing.push(region);
                                }
                            }
                        }
                        if (typeof details.regionRestriction.blocked !== "undefined") {
                            for (var i in this.config.regions) {
                                if (!this.config.regions.hasOwnProperty(i)) {
                                    continue;
                                }
                                var region = this.config.regions[i];
                                if (details.regionRestriction.blocked.indexOf(region) !== -1) {
                                    missing.push(region);
                                }
                            }
                        }
                        if (missing.length > 0) {
                            this.plug.room.sendChat("/me [Skipped] Video unavailable in: " + missing.join(" "));
                            this.plug.room.sendChat("/me http://polsy.org.uk/stuff/ytrestrict.cgi?ytid=" + advance.media.cid);
                            this.plugged.skipDJ(this.plugged.getCurrentDJ().id);
                        }

                    }
                }
            }.bind(this));
        }

    }
}
