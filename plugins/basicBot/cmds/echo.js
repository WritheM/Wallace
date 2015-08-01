module.exports = function (basicBot) {

    basicBot.events.command_echo = function (message) {
        if (message.from.rank >= this.core.ranks.COHOST) {
            var text = message.args.join(" ");
            message.from.sendChat(text);
            message.delete();
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };

};