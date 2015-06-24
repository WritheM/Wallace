module.exports = function (basicBot) {
    basicBot.events.command_kick = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            message.from.sendEmote("Not implemented yet");
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };
};