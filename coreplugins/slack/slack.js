var plugin;
var slack;
var config;

var events = {}

events.onLoad = function(plugin) {
    // dependency injection, any better methods for Node?
    this.plugin = plugin;
    config = plugin.getConfig();

    // https://www.npmjs.com/package/slack-node
    var Slack = require('slack-node');
    slack = new Slack();
    slack.setWebhook(config.webhookuri);
}

events.onUnload = function() {
}


function sendMessage(user, content) {
    slack.webhook({
        channel : config.channel,
        username : user,
        text : content
    }, function(err, response) {
        if (response.status != "ok") {
            console.log(response);
        }
    });
}

events.plug_join = function(user) {
    
}

events.plug_chat = function(message) {
    var content = message.message;
    
    var parts = content.split(" ");
    
    if (parts[0] == "/me") {
        parts.shift();
        content = "_" + parts.join(" ") + " _"; 
    }
        
    sendMessage(message.from.username, content);
}

events.plug_advance = function(track) {
    //on start: lastPlay: { dj: null, media: null, score: null }
    if (track.lastPlay.score != null) {
        sendMessage("Events", "*Last play:-* Woots: "+track.lastPlay.score.positive+", Grabs: "+track.lastPlay.score.grabs+", Mehs: "+track.lastPlay.score.negative);
    }
    sendMessage("Events", "*"+track.currentDJ.username+"* has started playing *"+track.media.author+"* - *"+track.media.title+"*");
}

module.exports = {
    "events" : events
};
