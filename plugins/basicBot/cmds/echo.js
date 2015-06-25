module.exports = function (basicBot) {

    basicBot.events.command_echo = function (message) {
        if (message.from.rank >= this.core.ranks.COHOST) {
            var text = message.message.substr(message.command.length + 2);
            basicBot.plug.sendChat(text);

            basicBot.plug.moderateDeleteChat(message.raw.cid);
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };

};