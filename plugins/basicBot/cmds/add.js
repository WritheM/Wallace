var plugAPI = require("plugapi");

module.exports = function (basicBot) {
    basicBot.events.command_add = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {

            var user = message.from;
            if (message.args.length > 0 && message.args[0][0] == "@") {
                user = this.plug.room.getUserByName(message.args[0]);
            }

            if (!user) {
                message.from.sendReply("Error: couldn't find user.");
            }
            else {
                console.log("adding ", user)
                user.addToWaitlist();
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};