var http = require('http');

var plugin;
var manager;
var slack;
var plug;
var config;

var events = {}
var server;
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

    server = http.createServer(slackRequest);
    server.listen(8124, "127.0.0.1");

}

events.onUnload = function() {
    server.close();
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

    
    if (config.ignoreself == true) {
        if (message.command)
            return;
        
        if (message.from.username == plug.getSelf().username)
            return;
    }
    
    var parts = content.split(" ");
    if (parts[0] == "/me") {
        parts.shift();
        content = "_" + parts.join(" ") + " _";
    }
    
    slack.notify({
        username : message.from.username,
        icon_url : "https://www.d3s.co/plug/badges/" + message.from.badge + ".png",
        text : content
    });
}

events.plug_advance = function(track) {
    // on start: lastPlay: { dj: null, media: null, score: null }

    var message = [];

    if (track.lastPlay != undefined && track.lastPlay.dj != null) {
        message.push({
            text : "*Last play:-* Woots: " + track.lastPlay.score.positive + ", Grabs: " + track.lastPlay.score.grabs
                    + ", Mehs: " + track.lastPlay.score.negative,
            color : "#36a64f",
            author_name : track.lastPlay.dj.username,
            author_icon : "https://www.d3s.co/plug/badges/" + track.lastPlay.dj.badge + ".png",
            mrkdwn_in: ["text", "pretext"]
        });
    }
    if (track.currentDJ != null) {
        message.push({
            text : "*" + track.currentDJ.username + "* has started playing *" + track.media.author + "* - *"
                    + track.media.title + "*",
            color : "#99004c",
            author_name : track.currentDJ.username,
            author_icon : "https://www.d3s.co/plug/badges/" + track.currentDJ.badge + ".png",
            image_url : track.media.image,
            mrkdwn_in: ["text", "pretext"]
        });
    }
    else {
        message.push({
            text : "*No track playing*",
            color : "#ff0000",
            mrkdwn_in: ["text", "pretext"]
        });
    }

    slack.notify({
        username : "Events",
        attachments : message
    });

}

function slackRequest(req, res) {
    var body = ''
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {
        var qs = require('querystring');
        receivedSlackMessage(qs.parse(body));
    });

    res.writeHead(200);
    res.end();
};

function receivedSlackMessage(message) {
    if (message.user_id == "USLACKBOT")
        return;

    // command
    if (message.text[0] == "!") {
        var cmd = message.text.substr(1).split(' ')[0];
        var args = message.text.substr(1 + cmd.length + 1).split(' ');
        
        plugin.manager.fireEvent("command_"+cmd, {
            command: cmd,
            args: args,
            message: message.text,
            from: new SlackUser(message, slack)
        });
    }
    else {
        plug.sendChat("#" + message.user_name + "# " + message.text);        
    }
    
    plugin.manager.fireEvent("chat", {
        message: message.text,
        from: new SlackUser(message, slack)
    });
    
}

var admins = ["ylt", "pironic"]; 

var SlackUser = function(user, slack) {
    this.user = user;
    this.slack = slack;
    
    this.rank = 0;
    
    //no tidy way of doing this for now
    if (admins.indexOf(user.user_name) != -1)
        this.rank = 100;
};

SlackUser.prototype.sendChat = function(message) {
    slack.notify({text: message});
}

SlackUser.prototype.sendReply = function(message) {
    slack.notify({text: "[<@"+this.user.user_id+">] "+message});
}

module.exports = {
    "events" : events
};
