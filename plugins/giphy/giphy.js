var PluginInstance = require(__core + "PluginInstance.js");
var giphy = new PluginInstance();

var request = require("request");
var qs = require("querystring");

giphy.events.command_gif = function (request) {
    var tags = null;
    if (request.args.length > 0) {
        tags = request.args.join(" ");
    }

    this.get_gif(tags, function (id) {
        if (typeof id !== 'undefined') {
            request.from.sendReply("http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
        }
        else {
            request.from.sendReply("Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
        }
    });

};

giphy.get_gif = function (tags, func) {
    var params = {
        "api_key": this.config.api_key,
        "rating": this.config.rating,
        "format": "json"
    };
    if (tags !== null) {
        params.tag = tags;
    }

    var query = qs.stringify(params);
    request(this.config.url + "?" + query, function (error, response, body) {
        if (error || response.statusCode != 200) {
            console.error("giphy: Got error: " + body);
        }
        else {
            func(JSON.parse(body).data.id);
        }
    });
};

module.exports = giphy;