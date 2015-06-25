module.exports = function (basicBot) {

    basicBot.events.command_echo = function (message) {
        var text = message.message.substr(message.command.length + 2);
        basicBot.plug.sendChat(text);

        if (typeof message.plug !== 'undefined')
            basicBot.plug.moderateDeleteChat(message.raw.cid);
    };
};