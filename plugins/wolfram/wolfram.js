let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

let request = require("request");

export default class Wolfram extends PluginInstance {
    @EventHandler()
    command_wa(message) {
        if (this.config.url !== null
            && this.config.url.length > 0) {
            if (message.args.length > 0) {
                request(this.config.url + encodeURIComponent(message.args.join(" ")), function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        console.error("!wa: Got Error:" + body);
                    }
                    else {
                        message.from.sendReply(body.replace(/[\r\n]/g, ""), {emote: true});
                    }
                }.bind(this));
            }
            else {
                message.from.sendReply("Searched for nothing. Did you mean `Nihilism`?", {emote: true});
            }
        }
        else {
            console.log("url set as: " + this.config.url);
        }
    }
}