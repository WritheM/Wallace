module.exports = function (basicBot) {
    basicBot.events.command_lock = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            this.plugged.setLock(true, false);
            this.plug.room.sendChat("/me [" + message.from.username+" locked the wait list.]");
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};