var plugin;
var slack;
var config;

var events = {}

events.onLoad = function(plugin) {
    // dependency injection, any better methods for Node?
    this.plugin = plugin;
    config = plugin.GetConfig();

    // https://www.npmjs.com/package/slack-node
    var Slack = require('slack-node');
    slack = new Slack();
    slack.setWebhook(config.webhookuri);
}

events.onUnload = function() {
}

events.plug_join = function(user) {

}

events.plug_chat = function(message) {

    slack.webhook({
        channel : config.channel,
        username : config.username,
        text : "[" + message.from.username + "] " + message.message
    }, function(err, response) {
        if (response.status != "ok") {
            console.log(response);
        }
    });

}

module.exports = {
    "events" : events
};
