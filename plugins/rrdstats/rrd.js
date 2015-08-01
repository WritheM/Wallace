var PluginInstance = require(__core + "PluginInstance.js");
var rrd = new PluginInstance();

var request = require("request");
var plugAPI = require("plugapi");

rrd.init = function () {
    this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method

    rrd.statsTimer = setInterval(function () {
        this.save_stats();
    }, 30 * 1000);
    this.save_stats();
};

rrd.events.onUnload = function () {
    clearInterval(rrd.statsTimer);
};

rrd.events.plug_userJoin = function (user) {
    this.save_stats();
};

rrd.events.plug_userLeave = function (user) {
    this.save_stats();
};

rrd.events.plug_advance = function (track) {
    this.save_stats();
};

rrd.get_stats = function () {
    var users = this.plug.getUsers();
    //console.log(users);
    var data = {};
    data.djs = this.plug.getWaitList().length + (typeof this.plug.getDJ() === "undefined" ? 0 : 1);
    data.listeners = users.length;
    data.guests = this.plug.getGuests();
    data.user = 0;
    data.residentDJ = 0;
    data.bouncer = 0;
    data.manager = 0;
    data.coHost = 0;
    data.host = 0;
    data.brandAmbassador = 0;
    data.admin = 0;
    var levels = {};
    levels.count = 0;
    levels.sum = 0;
    for (var i = 0; i < users.length; ++i) {
        var rawrank = users[i].role;
        if (users[i].gRole === plugAPI.GLOBAL_ROLES.ADMIN) {
            ++data.admin;
        } else if (parseInt(users[i].gRole, 10) > 1) {
            ++data.brandAmbassador;
        } else {
            switch (rawrank) {
                case plugAPI.ROOM_ROLE.NONE:
                    ++data.user;
                    break;
                case plugAPI.ROOM_ROLE.RESIDENTDJ:
                    ++data.residentDJ;
                    break;
                case plugAPI.ROOM_ROLE.BOUNCER:
                    ++data.bouncer;
                    break;
                case plugAPI.ROOM_ROLE.MANAGER:
                    ++data.manager;
                    break;
                case plugAPI.ROOM_ROLE.COHOST:
                    ++data.coHost;
                    break;
                case plugAPI.ROOM_ROLE.HOST:
                    ++data.host;
                    break;
                default:
                    ++data.user;
                    console.log(users[i]);
                    break;
            }
        }
        ++levels.count;
        levels.sum += users[i].level;
    }
    data.avgLevel = levels.sum / levels.count;
    return data;
};

rrd.save_stats = function () {
    clearInterval(rrd.statsTimer);
    rrd.statsTimer = setInterval(function () {
        rrd.save_stats();
    }, 30 * 1000);

    if (this.config.url !== null
        && typeof this.config.url !== "undefined"
        && this.config.url.length > 0) {

        var data = this.get_stats();

        request.post({
            url: this.config.url,
            headers: {
                "Content-Type": "application/json"
            },
            json: [data]
        }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error("rrd error:", error, response, body);
            }
        });
    }
};

module.exports = rrd;
