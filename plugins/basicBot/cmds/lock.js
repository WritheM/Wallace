module.exports = function (basicBot) {
    basicBot.events.command_lock = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            this.plug.moderateLockWaitList(true, false);
            this.plug.sendChat("/me [" + message.from.username+" locked the wait list.]");
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};