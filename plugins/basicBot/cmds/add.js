var plugAPI = require("plugapi");

module.exports = function (basicBot) {
    basicBot.events.command_add = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            this.plug.moderateAddDJ(message.args[0].id);
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };
};