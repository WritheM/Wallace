module.exports = function (basicBot) {
    basicBot.events.command_unmute = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            //TODO: !unmute
            //message.from.sendEmote("Not implemented yet");
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};