module.exports = function (basicBot) {
    basicBot.events.command_move = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            var user = message.getUser(0);
            var target = message.getUser(1);
            var position;
            if (target !== undefined) {
                position = target.getWaitlistPosition();
            }
            else {
                position = parseInt(message.args[1]);
            }

            if (!user) {
                message.sendReply("Error, couldn't find user");
            }
            else if (isNaN(position) || position < 0) {
                message.sendReply("Invalid position");
            }
            else {
                user.moveDJ(position, function() { });
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};