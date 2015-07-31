module.exports = function (basicBot) {

    basicBot.events.command_say = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            var text = message.message.substr(message.command.length + 2);
            basicBot.plug.sendChat(message.from.username+": "+text);

            basicBot.plug.moderateDeleteChat(message.raw.cid);
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};