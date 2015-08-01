var PluginInstance = require(__core + "PluginInstance.js");
var slack = new PluginInstance();

var http = require("http");
var request = require("request");
var fs = require("fs");
var path = require("path");
var SlackUser = require("./SlackUser.js");

slack.init = function () {
    this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method

    var Slack = require("node-slackr");
    this.slack = new Slack(this.config.webhookuri, {
        channel: this.config.channel,
        username: this.config.username
    });


    if (this.config.server !== undefined) {
        this.server = http.createServer(this.slackRequest.bind(this));
        this.server.listen(this.config.server.port, this.config.server.host);
    }

    if (this.config.usertoken) {
        this.pollTimer = setInterval(this.fetchUsers.bind(this), (this.config.fetchInterval || 30) * 1000);
        this.fetchUsers.bind(this)();
    }

    this.slackEmotes = JSON.parse(fs.readFileSync(path.join(__dirname, "emotes.json")));
};

slack.events.onUnload = function () {
    if (this.server) {
        this.server.close();
    }
    if (this.pollTimer) {
        clearTimeout(this.pollTimer);
    }
};

slack.fetchUsers = function () {
    //console.log("users", this);
    request("https://slack.com/api/users.list?token=" + this.config.usertoken, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            slack.slackUsers = JSON.parse(body);
        }
        else {
            console.error(response);
        }
    });
};

slack.plugToSlack = function (message) {
    function escape(text) {
        return (text).replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, '\\$1');
    }

    if (this.slackUsers) {
        for (var i = 0; i < this.slackUsers.members.length; i++) {
            var user = this.slackUsers.members[i];
            message = message.replace("@" + user.name, "<@" + user.id + "|" + user.name + ">");
        }
    }

    for (var k in this.slackEmotes) {
        if (this.slackEmotes.hasOwnProperty(k)) {
            var emote = this.slackEmotes[k];
            var replace = new RegExp("(^|\\s)" + escape(k) + "(?=$|\\s)", "g");
            message = message.replace(replace, "$1:" + emote + ":");
        }
    }
    return message;
};

slack.slackToPlug = function (message) {
    /*if (this.slackUsers) {
        for (var i = 0; i < this.slackUsers.members.length; i++) {
            var user = this.slackUsers.members[i];
            //TODO: replace with a regex
            message = message.replace("<@" + user.id + "|" + user.name + ">", "@" + user.name);
            message = message.replace("<@" + user.id + ">", "@" + user.name);
        }
    }*/

    //console.log("message", this);

    message = message.replace(/<(.*?)>/g, (function (match, p1) {
        var parts = p1.split("|");
        var link = parts[0];
        var text = parts[1];

        if (link[0] == "@") { //userid
            if (this.slackUsers) {
                //find and return the user
                for (var i = 0; i < this.slackUsers.members.length; i++) {
                    var user = this.slackUsers.members[i];
                    if ("@" + user.id == link) {
                        return "@" + user.name;
                    }
                }
            }
            //we haven't found the user, try returning just the text
            if (text) {
                return text;
            }
            else {
                //else.. make do with the id :/
                return link;
            }
        }
        else { //regular link
            if (text && text != link) {
                return link + "(" + text + ")";
            }
            return link;
        }
    }).bind(this));


    for (var k in this.slackEmotes) {
        if (this.slackEmotes.hasOwnProperty(k)) {
            var emote = this.slackEmotes[k];
            message = message.replace(":" + emote + ":", k);
        }
    }

    return message;
};

slack.events.plug_join = function (user) {

};

slack.events.plug_sendchat = function(message, options) {
    options.hidden = options.hidden || false;

    var messageData = {
        from: this.plug.getSelf(),
        message: message,
        internal: true
    };

    if (options.emote) {
         messageData.message = "/me " + messageData.message;
    }

    if (!options.hidden) {
        slack.events.plug_chat.bind(this)(messageData);
    }
    
};

slack.events.plug_chat = function (message) {
    var content = slack.plugToSlack(message.message);



    if (!message.internal && message.from.username === this.plug.getSelf().username) {
        return;
    }


    var parts = content.split(" ");
    if (parts[0] === "/me") {
        parts.shift();
        content = "_" + parts.join(" ") + " _";
    }

    slack.slack.notify({
        username: message.from.username,
        icon_url: "https://www.d3s.co/plug/badges/" + message.from.badge + ".png",
        text: content
    });
};

slack.events.plug_advance = function (track) {
    // on start: lastPlay: { dj: null, media: null, score: null }

    var message = [];

    if (track.lastPlay !== undefined && track.lastPlay.dj) {
        message.push({
            text: "*Last play:-* Woots: " + track.lastPlay.score.positive + ", Grabs: " + track.lastPlay.score.grabs
            + ", Mehs: " + track.lastPlay.score.negative,
            color: "#99004c",
            author_name: track.lastPlay.dj.username,
            author_icon: "https://www.d3s.co/plug/badges/" + track.lastPlay.dj.badge + ".png",
            mrkdwn_in: ["text", "pretext"]
        });
    }
    if (track.currentDJ) {
        message.push({
            text: "*" + track.currentDJ.username + "* has started playing *" + track.media.author + "* - *"
            + track.media.title + "*",
            color: "#36a64f",
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

    slack.slack.notify({
        username: "Events",
        attachments: message
    });

};

slack.slackRequest = function (req, res) {
    var that = this;
    if (req.method !== "POST") {
        res.writeHead("403", "Fuck off");
        res.end();
        req.connection.destroy();
        return;
    }

    var body = "";
    req.on("data", function (data) {
        body += data;
    });
    req.on("end", function () {
        var qs = require("querystring");
        that.receivedSlackMessage(qs.parse(body));
    });

    res.writeHead(200);
    res.end();
};

slack.receivedSlackMessage = function (message) {
    if (!message.token || (this.config.server.token && message.token !== this.config.server.token)) {
        return;
    }

    if (message.user_id === "USLACKBOT") {
        return;
    }

    // command
    if (message.text[0] === "!") {
        var cmd = message.text.substr(1).split(" ")[0];
        var args = message.text.substr(1 + cmd.length + 1).split(" ");

        this.manager.fireEvent("command_" + cmd, {
            command: cmd,
            args: args,
            message: message.text,
            from: new SlackUser(message, slack)
        });
    }
    else {
        this.plug.sendChat("<`" + message.user_name + "@slack`> " + this.slackToPlug.bind(slack)(message.text));
    }

    this.plugin.manager.fireEvent("chat", {
        message: message.text,
        from: new SlackUser(message, this)
    });

};

module.exports = slack;