module.exports = function (basicBot) {

    basicBot.events.command_say = function (message) {
        var text = message.message.substr(message.command.length + 2);
        basicBot.plug.sendChat(message.from.username+": "+text);

        if (typeof message.plug !== 'undefined')
            basicBot.plug.moderateDeleteChat(message.raw.cid);
    };
};