module.exports = function (basicBot) {
    basicBot.events.command_move = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            var user = message.getUser(0);
            var target = message.getUser(1);
            var position = target?target.getWaitlistPosition():parseInt(message.args[1]);

            if (!user) {
                message.sendReply("Error, couldn't find user");
            }
            else if (!isFinite(position)) {
                message.sendReply("Invalid position");
            }
            else {
                user.moveDJ(position);
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};