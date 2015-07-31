module.exports = function (basicBot) {
    basicBot.events.command_unlock = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            this.plug.moderateLockWaitList(false,false);
            this.plug.sendChat("/me [" + message.from.username+" unlocked the wait list.]");
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};