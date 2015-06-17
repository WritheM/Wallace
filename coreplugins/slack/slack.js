var plugin;
var manager;
var slack;
var plug;
var config;

var events = {}

events.onLoad = function(_plugin) {
    plugin = _plugin;
    config = plugin.getConfig();
    
    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;
    

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

    if (track.lastPlay != undefined && track.lastPlay.dj != null) {
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

var http = require('http');
http.createServer(function (req, res) {
  var body = ''
  req.on('data', function (data) {
      body += data;
  });
  req.on('end', function () {
      var qs = require('querystring');
      receivedSlackMessage(qs.parse(body));
  });
  
  res.writeHead(200);
  res.end();
}).listen(8124, "127.0.0.1");

function receivedSlackMessage(message) {
    if (message.user_id == "USLACKBOT")
        return;
    
    //command
    if (message.message.text[0] == "!") {
        
    }
    
    plug.sendChat("#"+message.user_name+"# "+message.text);
}

module.exports = {
    "events" : events
};
