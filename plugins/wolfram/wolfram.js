var PluginInstance = require(__core + "PluginInstance.js");
var wolfram = new PluginInstance();

var request = require("request");
var qs = require("qs");

wolfram.command_wa = function (request) {
    if (config.url !== null
        && config.url.length > 0) {

        request(config.url + encodeURIComponent(request.args.join(" ")), function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error("!wa: Got Error:" + body);
            }
            else {
                request.from.sendEmote("/me " + body);
            }
        });
    }
    else {
        console.log("url set as: " + config.url);
    }
};

module.exports = wolfram;