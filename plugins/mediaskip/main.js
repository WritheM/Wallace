var PluginInstance = require(__core + "PluginInstance.js");

var mediaskip = new PluginInstance();

var plugAPI = require("plugapi");
var google = require("googleapis");
var youtube = google.youtube("v3");

mediaskip.init = function () {
    this.plug = this.manager.getPlugin("plug")
    this.plugged = this.manager.getPlugin("plug").plug; //TODO: implement better method

    mediaskip.events.plug_advance.call(this, {"media": this.plug.getMedia()});
};

mediaskip.events.plug_advance = function (advance) {
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
                this.plug.skipDJ.skipDJ();
            }
            else {
                var video = results.items[0];
                var details = video.contentDetails;
                if (typeof details.regionRestriction !== "undefined") {
                    var missing = [];
                    if (typeof details.regionRestriction.allowed !== "undefined") {
                        for (var i in mediaskip.config.regions) {
                            if (!mediaskip.config.regions.hasOwnProperty(i)) {
                                continue;
                            }
                            var region = mediaskip.config.regions[i];
                            if (details.regionRestriction.allowed.indexOf(region) === -1) {
                                missing.push(region);
                            }
                        }
                    }
                    if (typeof details.regionRestriction.blocked !== "undefined") {
                        for (var i in mediaskip.config.regions) {
                            if (!mediaskip.config.regions.hasOwnProperty(i)) {
                                continue;
                            }
                            var region = mediaskip.config.regions[i];
                            if (details.regionRestriction.blocked.indexOf(region) !== -1) {
                                missing.push(region);
                            }
                        }
                    }
                    if (missing.length > 0) {
                        mediaskip.plug.room.sendChat("/me [Skipped] Video unavailable in: " + missing.join(" "));
                        mediaskip.plug.room.sendChat("/me http://polsy.org.uk/stuff/ytrestrict.cgi?ytid=" + advance.media.cid);
                        mediaskip.plugged.skipDJ(mediaskip.plugged.getCurrentDJ().id);
                    }

                }
            }
        });
    }

};

module.exports = mediaskip;