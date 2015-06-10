var plugin;
var manager;
var plug;
var config;
var http = require('http');

var events = {};

events.onLoad = function(_plugin) {
    plugin = _plugin;
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
    config = plugin.getConfig();
}

events.plug_command_wa = function(request) {
    if (config.url !== null
        && config.url.length > 0)
    {
        //console.log("!wa: query:");
        http.get(config.url+encodeURIComponent(request.args), function(res) {
            //console.log("!wa: Got response: " + res.statusCode);
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                plug.sendChat("/me " +chunk);
            });
        }).on('error', function(e) {
            console.log("!wa: Got Error:"+ e.message);
        });
    } else {
        console.log("url set as: " + config.url);
    }
}

module.exports = {
    "events" : events
};