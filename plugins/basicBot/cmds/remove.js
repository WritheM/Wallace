module.exports = function (basicBot) {
    basicBot.events.command_remove = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
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
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};