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

events.plug_command_gif = function(request) {
    if (request.args.length > 0) {
        var tags = request.args.join(" ");
        this.plug_command_gif.get_gif(tags, function(id) {
            if (typeof id !== 'undefined') {
                plug.sendChat("/me [@"+request.from.username+"] http://media.giphy.com/media/"+id+"/giphy.gif [Tags: "+tags+"]");
            } else {
                plug.sendChat("/me [@"+request.from.username+"] Invalid tags, try something different. [Tags: "+tags+"]");
            }
        });
    }
    else {
        this.plug_command_gif.get_gif(null, function(id) {
            if (typeof id !== 'undefined') {
                plug.sendChat("/me [@"+request.from.username+"] http://media.giphy.com/media/"+id+"/giphy.gif [Random GIF]");
            } else {
                plug.sendChat("/me [@"+request.from.username+"] Invalid request, try again.");
            }
        });
    }
}

events.plug_command_gif.get_gif = function(tags, func)
{
    //console.log("giphy query:");
    var params = "?api_key="+config.api_key+"&rating="+ config.rating+"&format=json";
    if (tags !== null)
        params += "&tags="+encodeURIComponent(tags);

    http.get(config.url+params, function(res) {
        //console.log("giphy resp: " + res.statusCode);
        res.setEncoding('utf8');

        var body = "";
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
           func(JSON.parse(body).data.id);
        });
    }).on('error', function(e) {
        console.log("giphy: Got error: " + e.message);
        //plug.sendChat("giphy: Got error: " + e.message);
    });
}

module.exports = {
    "events" : events
};