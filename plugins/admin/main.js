let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");
let CommandHandler = require(__core + "Plugin/CommandHandler.js");

export default class BasicBot extends PluginInstance {
    init() {
        this.plug = this.manager.getPlugin("plug");
    }


    /*
     Waitlist
     */

    @CommandHandler("add", {rank: "bouncer"})
    add(message) {
        var user = message.from;
        if (message.args.length > 0) {
            user = message.getUser(0);
        }

        if (!user) {
            message.from.sendReply("Error: couldn't find user.");
        }
        else {
            user.addToWaitlist();
        }
    }

    @CommandHandler("remove", {rank: "bouncer"})
    remove(message) {
        var user = message.from;
        if (message.args.length > 0) {
            user = message.getUser(0);
        }

        if (!user) {
            message.from.sendReply("Error: couldn't find user.");
        }
        else {
            user.removeWaitlist();
        }
    }

    @CommandHandler("move", {rank: "bouncer"})
    move(message) {
        var user = message.getUser(0);
        var target = message.getUser(1);
        var position = 0;
        if (target !== undefined) {
            position = target.getWaitlistPosition();
        }
        else {
            position = parseInt(message.args[1]);
        }

        if (!user) {
            message.from.sendReply("Error, couldn't find user");
        }
        else if (isNaN(position) || position < 0) {
            message.from.sendReply("Invalid position");
        }
        else {
            user.moveDJ(position, function () {
            });
        }
    }

    @CommandHandler("lock", {rank: "bouncer"})
    lock(message) {
        this.plug.plugged.setLock(true, false, (error) => {
            if (error) {
                this.plug.room.sendChat("Error (likely plug, please try again)");
            }
            else {
                this.plug.room.sendChat("/me [" + message.from.username + " locked the wait list.]");
            }
        });

    }

    @CommandHandler("unlock", {rank: "bouncer"})
    unlock(message) {
        this.plug.plugged.setLock(false, false);
        this.plug.room.sendChat("/me [" + message.from.username + " unlocked the wait list.]");
    }


    /*
     Current DJ
     */

    @CommandHandler("link", {rank: "normal"})
    link(message) {
        var media = this.plug.plugged.getMedia();
        if (typeof media === "undefined") {
            message.from.sendReply("The link to the currently playing song is: http://youtu.be/dQw4w9WgXcQ", {emote: true});
        }
        else if (media.format === 1) {
            message.from.sendReply("The link to the currently playing song is: http://youtu.be/" + media.cid, {emote: true});
        }
        /*else if (media.format === 2) {
         // TODO: soundcloud api for link: https://developers.soundcloud.com/docs
         SC.get("/tracks/" + media.cid, function (sound) {
         API.sendChat(subChat(basicBot.chat.songlink, {name: from, link: sound.permalink_url}));
         });
         }*/
        else {
            message.from.sendReply("The media format of this song is not supported yet.", {emote: true});
        }
    }

    @CommandHandler("skip", {rank: "bouncer"})
    skip(message) {
        this.plug.room.sendChat("/me [" + message.from.username + " used skip, it was very effective!]");
        let dj = this.plug.room.getDJ();
        if (!dj) {
            message.from.sendReply("No user currently DJing");
        }
        else {
            dj.skipDJ((error, message) => {
                if (error) {
                    message.from.sendReply("Error (likely plug, please try again)");
                }
                else if (this.config.skip && this.config.skip.reasons) {
                    let reason = this.config.skip.reasons[message.args[0]];

                    if (reason) {
                        dj.sendReply(reason, {emote: true});
                    }
                }

            });
        }
    }

    /*
     Users
     */

    @CommandHandler("ban", {rank: "bouncer"})
    ban(message) {
        let user = message.getUser(0);

        if (!user) {
            message.sendReply("Error, couldn't find user");
        }
        else {
            user.ban();
        }
    }

    @CommandHandler("unban", {rank: "bouncer"})
    unban(message) {
        let username = message.message;
        //if it begins with an @, strip it
        if (username[0] == "@") {
            username = username.substring(1);
        }
        this.plug.room.getBan(username, (e, ban) => {
            if (e) {
                message.sendReply("Error, couldn't find user");
            }
            else {
                //message.sendReply("User found, unbanning");
                this.plug.plugged.unbanUser(ban.id, (e) => {
                    if (!e) {
                        message.sendReply("User successfully unbanned");
                    }
                    else {
                        message.sendReply("Plug Error: " + e);
                    }
                })
            }
        });
    }

    @CommandHandler("mute", {rank: "bouncer"})
    mute(message) {
        var user = message.getUser(0);

        if (!user) {
            message.sendReply("Error, couldn't find user");
        }
        else {
            user.mute();
        }
    }

    @CommandHandler("unmute", {rank: "bouncer"})
    unmute(message) {
        var user = message.getUser(0);

        if (!user) {
            message.sendReply("Error, couldn't find user");
        }
        else {
            user.unmute();
        }
    }

    @CommandHandler("kick", {rank: "manager"})
    kick(message) {
        var user = message.getUser(0);

        if (!user) {
            message.sendReply("Error, couldn't find user");
        }
        else {
            user.kick();
        }
    }


    /*
     Misc
     */

    @CommandHandler("echo", {rank: "manager"})
    echo(message) {
        var text = message.args.join(" ");
        message.from.sendChat(text);
        message.delete();
    }

    @CommandHandler("logout", {rank: "bouncer"})
    logout(message) {
        message.from.sendChat("Exiting now!", {emote: true});
        setTimeout(function () {
            process.exit();
        }, 1000);
    }

    @CommandHandler("ping", {rank: "bouncer"})
    ping(message) {
        var response = "Pong! Your access level is currently: " + message.from.rank.toString();
        message.from.sendReply(response, {emote: true});
    }


    @CommandHandler("say", {rank: "manager"})
    say(message) {
        message.from.sendChat(message.from.username + ": " + message.message);
        message.delete();
    }

}