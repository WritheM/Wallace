module.exports = function (basicBot) {

    basicBot.events.command_say = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            var text = message.args.join(" ");
            message.from.sendChat(message.from.username+": "+text);
            message.delete();
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};