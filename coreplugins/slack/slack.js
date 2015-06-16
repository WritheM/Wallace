var plugin;
var slack;
var config;

var events = {}

events.onLoad = function(plugin) {
    // dependency injection, any better methods for Node?
    this.plugin = plugin;
    config = plugin.getConfig();

    // https://www.npmjs.com/package/slack-node
    var Slack = require('node-slackr');
    slack = new Slack(config.webhookuri, {
        channel : config.channel,
        username : config.username
    });
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

    // sendMessage(message.from.username, content);

    /*
     * slack.webhook({ channel : config.channel, username :
     * message.from.username, text : content, "icon_url":
     * "https://slack.com/img/icons/app-57.png" }, function(err, response) { if
     * (response.status != "ok") { console.log(response); } });
     */

    slack.notify({
        username : message.from.username,
        icon_url : "https://www.d3s.co/plug/badges/" + message.from.badge + ".png",
        text: content
    });

    //console.log("https://www.d3s.co/plug/badges/" + message.from.badge + ".png")
}

events.plug_advance = function(track) {
    // on start: lastPlay: { dj: null, media: null, score: null }

    var message = [];

    if (track.lastPlay.dj != null) {
        message.push({
            text : "*Last play:-* Woots: " + track.lastPlay.score.positive + ", Grabs: " + track.lastPlay.score.grabs
                    + ", Mehs: " + track.lastPlay.score.negative,
            color : "#36a64f",
            author_name: track.lastPlay.dj.username,
            author_icon: "https://www.d3s.co/plug/badges/" + track.lastPlay.dj.badge + ".png"
        });
    }
    if (track.currentDJ != null) {
        message.push({
            text : "*" + track.currentDJ.username + "* has started playing *" + track.media.author + "* - *"
                    + track.media.title + "*",
            color : "#99004c",
            author_name: track.currentDJ.username,
            author_icon: "https://www.d3s.co/plug/badges/" + track.currentDJ.badge + ".png",
            image_url: track.media.image
        });
    }
    else {
        message.push({
            text : "*No track playing*",
            color : "#ff0000"
        });
    }
    // sendMessage("Events", );

    // text = message.join("\n");

    slack.notify({
        username : "Events",
        attachments : message
    });

    /*
     * slack.webhook({ channel : config.channel, username : "events",
     * attachments: [ ] }, function(err, response) { if (response.status !=
     * "ok") { console.log(response); } });
     */

}

module.exports = {
    "events" : events
};
