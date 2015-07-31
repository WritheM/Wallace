var plugAPI = require("plugapi");

module.exports = function (basicBot) {
    basicBot.events.command_add = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            // TODO: validate that the user is here and the argument is not empty.
            this.plug.moderateAddDJ(message.args[0].id);
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};