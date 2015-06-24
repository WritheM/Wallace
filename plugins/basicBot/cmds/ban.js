module.exports = function (basicBot) {

    basicBot.events.command_ban = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            //TODO: check if arg is user object
            var uid = message.args[0].id;
            //this.plug.moderateBanUser(uid, plugAPI.BAN.HOUR);
            this.plug.sendChat("abc: "+uid);
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };

};