var PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

var request = require("request");
var qs = require("querystring");

export default class Giphy {
    @EventHandler()
    command_gif(message) {
        var tags = null;
        if (message.args.length > 0) {
            tags = message.args.join(" ");
        }

        this.get_gif(tags, function (id) {
            if (typeof id !== "undefined") {
                message.from.sendReply("http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
            }
            else {
                message.from.sendReply("Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
            }
        });

    }

    get_gif(tags, func) {
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
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
            }
            else {
                func(JSON.parse(body).data.id);
            }
        }.bind(this));
    }
}