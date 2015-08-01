module.exports = function (basicBot) {
    basicBot.events.command_unban = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            //TODO: check if arg is user object
            user = message.getUser(0);

            if (!user) {
                message.sendReply("Error, couldn't find user");
            }
            else {
                //user.unmute();
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};