let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

import { autobind } from 'core-decorators';

let http = require("http");
let request = require("request");
let fs = require("fs");
let path = require("path");
let Entities = require('html-entities').XmlEntities;
let entities = new Entities();

let SlackUser = require("./SlackUser.js");

export default class Slack extends PluginInstance {
    init() {
        this.plug = this.manager.getPlugin("plug").plug; //TODO: implement better method

        let Slack = require("node-slackr");
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
    }

    @EventHandler()
    onUnload() {
        if (this.server) {
            this.server.close();
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }
    }

    fetchUsers() {
        //console.log("users", this);
        request("https://slack.com/api/users.list?token=" + this.config.usertoken, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                this.slackUsers = JSON.parse(body);
            }
            else {
                console.error(response);
            }
        }.bind(this));
    }

    plugToSlack(message) {
        function escape(text) {
            return (text).replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
        }

        if (this.slackUsers) {
            for (let i = 0; i < this.slackUsers.members.length; i++) {
                let user = this.slackUsers.members[i];
                message = message.replace("@" + user.name, "<@" + user.id + "|" + user.name + ">");
            }
        }

        for (let k in this.slackEmotes) {
            if (this.slackEmotes.hasOwnProperty(k)) {
                let emote = this.slackEmotes[k];
                let replace = new RegExp("(^|\\s)" + escape(k) + "(?=$|\\s)", "g");
                message = message.replace(replace, "$1:" + emote + ":");
            }
        }
        return message;
    }

    slackToPlug(message) {
        /*if (this.slackUsers) {
         for (let i = 0; i < this.slackUsers.members.length; i++) {
         let user = this.slackUsers.members[i];
         //TODO: replace with a regex
         message = message.replace("<@" + user.id + "|" + user.name + ">", "@" + user.name);
         message = message.replace("<@" + user.id + ">", "@" + user.name);
         }
         }*/

        //console.log("message", this);

        message = message.replace(/<(.*?)>/g, (function (match, p1) {
            let parts = p1.split("|");
            let link = parts[0];
            let text = parts[1];

            if (link[0] === "@") { //userid
                if (this.slackUsers) {
                    //find and return the user
                    for (let i = 0; i < this.slackUsers.members.length; i++) {
                        let user = this.slackUsers.members[i];
                        if ("@" + user.id === link) {
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
                if (text && text !== link) {
                    return link + "(" + text + ")";
                }
                return link;
            }
        }).bind(this));


        for (let k in this.slackEmotes) {
            if (this.slackEmotes.hasOwnProperty(k)) {
                let emote = this.slackEmotes[k];
                message = message.replace(":" + emote + ":", k);
            }
        }

        return message;
    }

    @EventHandler()
    plug_join(user) {

    }

    @EventHandler()
    plug_sendchat(message, options) {
        options.hidden = options.hidden || false;

        let messageData = {
            from: this.plug.getSelf(),
            message: message,
            internal: true
        };

        if (options.emote) {
            messageData.message = "/me " + messageData.message;
        }

        if (!options.hidden) {
            //this.events.plug_chat.bind(this)(messageData);
            this.plug_chat(messageData);
        }
    }

    @EventHandler()
    plug_chat(message) {
        console.log(this.events);
        let content = this.plugToSlack(message.message);


        if (!message.internal && message.from.username === this.plug.getSelf().username) {
            return;
        }


        let parts = content.split(" ");
        if (parts[0] === "/me") {
            parts.shift();
            content = "_" + parts.join(" ") + " _";
        }

        this.slack.notify({
            username: message.from.username,
            icon_url: "https://www.d3s.co/plug/badges/" + message.from.badge + ".png",
            text: content
        });
    }

    @EventHandler()
    plug_advance(track) {
        // on start: lastPlay: { dj: null, media: null, score: null }

        let message = [];

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

        this.slack.notify({
            username: "Events",
            attachments: message
        });

    }

    slackRequest(req, res) {
        if (req.method !== "POST") {
            res.writeHead("403", "Fuck off");
            res.end();
            req.connection.destroy();
            return;
        }

        let body = "";
        req.on("data", function (data) {
            body += data;
        });
        req.on("end", function () {
            let qs = require("querystring");
            this.receivedSlackMessage(qs.parse(body));
        }.bind(this));

        res.writeHead(200);
        res.end();
    }

    receivedSlackMessage(message) {
        if (!message.token || (this.config.server.token && message.token !== this.config.server.token)) {
            return;
        }

        if (message.user_id === "USLACKBOT") {
            return;
        }

        message.text = entities.decode(message.text);

        // command
        if (message.text[0] === "!") {
            let cmd = message.text.substr(1).split(" ")[0];
            let args = message.text.substr(1 + cmd.length + 1).split(" ");

            this.manager.fireEvent("command_" + cmd, {
                command: cmd,
                args: args,
                message: message.text,
                from: new SlackUser(message, slack)
            });
        }
        else {
            this.plug.sendChat("<" + message.user_name + "@slack> " + this.slackToPlug(message.text));
        }

        this.plugin.manager.fireEvent("chat", {
            message: message.text,
            from: new SlackUser(message, this)
        });

    }
}