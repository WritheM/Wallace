var PluginInstance = require(__core + "PluginInstance.js");
var wolfram = new PluginInstance();

var request = require("request");

wolfram.events.command_wa = function (message) {
    if (this.config.url !== null
        && this.config.url.length > 0) {
        if (message.args.length > 0) {
        request(this.config.url + encodeURIComponent(message.args.join(" ")), function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error("!wa: Got Error:" + body);
            }
            else {
                message.from.sendReply(body.replace(/[\r\n]/g, ""), {emote:true});
            }
        });
        }
        else {
            message.from.sendReply("Searched for nothing. Did you mean `Nihilism`?", {emote:true});
        }
    }
    else {
        console.log("url set as: " + this.config.url);
    }
};

module.exports = wolfram;
