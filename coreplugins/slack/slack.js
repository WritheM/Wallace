var http = require('http');
var request = require('request');
var fs = require('fs');
var path = require('path');

var plugin;
var manager;
var slack;
var plug;
var config;

var events = {};
var server;

var pollTimer;
var slackUsers;
var slackEmotes;

events.onLoad = function (_plugin) {
    plugin = _plugin;
    config = plugin.getConfig();

    manager = plugin.manager;
    plug = manager.getPlugin("plug").plugin.plug;

    var Slack = require('node-slackr');
    slack = new Slack(config.webhookuri, {
        channel: config.channel,
        username: config.username
    });


    if (config.server != undefined) {
        server = http.createServer(slackRequest);
        server.listen(config.server.port, config.server.host);
    }

    if (config.usertoken) {
        pollTimer = setInterval(fetchUsers, (config.fetchInterval || 30) * 1000);
        fetchUsers();
    }

    slackEmotes = JSON.parse(fs.readFileSync(path.join(__dirname, "emotes.json")));
};

events.onUnload = function () {
    if (server)
        server.close();
    if (pollTimer)
        clearTimer(pollTimer)
};

function fetchUsers() {
    request("https://slack.com/api/users.list?token=" + config.usertoken, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            slackUsers = JSON.parse(body);
        }
        else {
            console.log(response);
        }
    });
}

function plugToSlack(message) {
    if (slackUsers) {
        for (var i = 0; i < slackUsers.members.length; i++) {
            var user = slackUsers.members[i];
            message = message.replace("@" + user.name, "<@" + user.id + "|" + user.name + ">");
        }
    }

    for (var k in slackEmotes) {
        var emote = slackEmotes[k];
        message = message.replace(k, ":" + emote + ":");
    }

    return message;
}

function slackToPlug(message) {
    if (slackUsers) {
        for (var i = 0; i < slackUsers.members.length; i++) {
            var user = slackUsers.members[i];
            //TODO: replace with a regex
            message = message.replace("<@" + user.id + "|" + user.name + ">", "@" + user.name);
            message = message.replace("<@" + user.id + ">", "@" + user.name);
        }
    }
    for (var k in slackEmotes) {
        var emote = slackEmotes[k];
        message = message.replace(":" + emote + ":", k);
    }

    return message;
}

events.plug_join = function (user) {

};

events.plug_chat = function (message) {
    var content = plugToSlack(message.message);


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
        username: message.from.username,
        icon_url: "https://www.d3s.co/plug/badges/" + message.from.badge + ".png",
        text: content
    });
};

events.plug_advance = function (track) {
    // on start: lastPlay: { dj: null, media: null, score: null }

    var message = [];

    if (track.lastPlay != undefined && track.lastPlay.dj != null) {
        message.push({
            text: "*Last play:-* Woots: " + track.lastPlay.score.positive + ", Grabs: " + track.lastPlay.score.grabs
            + ", Mehs: " + track.lastPlay.score.negative,
            color: "#36a64f",
            author_name: track.lastPlay.dj.username,
            author_icon: "https://www.d3s.co/plug/badges/" + track.lastPlay.dj.badge + ".png",
            mrkdwn_in: ["text", "pretext"]
        });
    }
    if (track.currentDJ != null) {
        message.push({
            text: "*" + track.currentDJ.username + "* has started playing *" + track.media.author + "* - *"
            + track.media.title + "*",
            color: "#99004c",
            author_name: track.currentDJ.username,
            author_icon: "https://www.d3s.co/plug/badges/" + track.currentDJ.badge + ".png",
            image_url: track.media.image,
            mrkdwn_in: ["text", "pretext"]
        });
    }
    else {
        message.push({
            text: "*No track playing*",
            color: "#ff0000",
            mrkdwn_in: ["text", "pretext"]
        });
    }

    slack.notify({
        username: "Events",
        attachments: message
    });

};

function slackRequest(req, res) {
    if (req.method != "POST") {
        res.writeHead("403", "Fuck off");
        res.end();
        req.connection.destroy();
        return;
    }

    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var qs = require('querystring');
        receivedSlackMessage(qs.parse(body));
    });

    res.writeHead(200);
    res.end();
}
function receivedSlackMessage(message) {
    if (!message.token || (config.server.token && message.token != config.server.token))
        return;

    if (message.user_id == "USLACKBOT")
        return;

    // command
    if (message.text[0] == "!") {
        var cmd = message.text.substr(1).split(' ')[0];
        var args = message.text.substr(1 + cmd.length + 1).split(' ');

        plugin.manager.fireEvent("command_" + cmd, {
            command: cmd,
            args: args,
            message: message.text,
            from: new SlackUser(message, slack)
        });
    }
    else {
        plug.sendChat("<`" + message.user_name + "@slack`> " + slackToPlug(message.text));
    }

    plugin.manager.fireEvent("chat", {
        message: message.text,
        from: new SlackUser(message, slack)
    });

}

var admins = ["ylt", "pironic"];

var SlackUser = function (user, slack) {
    this.user = user;
    this.slack = slack;

    this.rank = 0;

    //no tidy way of doing this for now
    if (admins.indexOf(user.user_name) != -1)
        this.rank = 100;
};

SlackUser.prototype.sendChat = function (message) {
    slack.notify({text: message});
};

SlackUser.prototype.sendReply = function (message) {
    slack.notify({text: "[<@" + this.user.user_id + ">] " + message});
};

SlackUser.prototype.sendEmote = function (message) {
    slack.notify({text: "_[<@" + this.user.user_id + ">] " + message + " _"});
};

module.exports = {
    "events": events
};
