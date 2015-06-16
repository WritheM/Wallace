var plugin;
var config;
var plug;

var statsTimer;

var events = {}

events.onLoad = function(_plugin) {
    plugin = _plugin;
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
    config = plugin.getConfig();

    statsTimer = setInterval(function() {save_stats();},30*1000);
    save_stats();
}

events.onUnload = function() {
    clearInterval(statsTimer);
}

events.plug_userJoin = function(user) {
    save_stats();
}

events.plug_userLeave = function(user) {
    save_stats();
}

events.plug_chat = function(message) {

}

events.plug_advance = function(track) {
    save_stats();
}

function save_stats() {
    clearInterval(statsTimer);
    statsTimer = setInterval(function() {save_stats();},30*1000);

    var http = require('http');
    var url = require('url');

    if (config.url !== null
        && typeof config.url !== "undefined"
        && config.url.length > 0)
    {
        var users = plug.getUsers();
        //console.log(users);
        var data = {};
        data.djs = plug.getWaitList().length + (typeof plug.getDJ() === 'undefined'?0:1);
        data.listeners = users.length;
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
        for (var i = 0;i < users.length;++i) {
            var rawrank = users[i].role;
            if (users[i].gRole == "5"){
                ++data.admin
            } else if (parseInt(users[i].gRole) > 1){
                ++data.brandAmbassador;
            } else if (rawrank == 0){
                ++data.user;
            } else if (rawrank == 1){
                ++data.residentDJ;
            } else if (rawrank == 2){
                ++data.bouncer;
            } else if (rawrank == 3){
                ++data.manager;
            } else if (rawrank == 4){
                ++data.coHost;
            } else if (rawrank == 5){
                ++data.host;
            } else {
                ++data.user;
                console.log(users[i])
            }
            ++levels.count;
            levels.sum = levels.sum + users[i].level;
            data.avgLevel = levels.sum / levels.count;

        }
        //console.log(data);
        var payload = "["+JSON.stringify(data)+"]";

        //console.log("rrdstats query:" + config.url);
        var link = url.parse(config.url, true, true);
        var options = {
            host: link.hostname,
            port: link.port,
            path: link.pathname,
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Content-Length': payload.length
            }
        };
        link = null;

        var req = http.request(options, function(resp) {
            //console.log('rrdstats response code: '+resp.statusCode);
            resp.on('data', function(chunk) {
                //console.log('BODY: ' + chunk);
                //console.log('HEADERS: '+JSON.stringify(resp.headers));
            })


        });
        req.on('error', function(e) {
            console.log('rrdstats error caught: ' + e.message);
        });
        req.write(payload);
        req.end();
    }
}

module.exports = {
    "events" : events
};
