var PluginInstance = require(__core + "PluginInstance.js");
var wolfram = new PluginInstance();

var request = require("request");

wolfram.command_wa = function (message) {
    console.log("wa detected");
    if (this.config.url !== null
        && this.config.url.length > 0) {

        request(this.config.url + encodeURIComponent(message.args.join(" ")), function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error("!wa: Got Error:" + body);
            }
            else {
                request.from.sendEmote("/me " + body);
            }
        });
    }
    else {
        console.log("url set as: " + this.config.url);
    }
};

module.exports = wolfram;
