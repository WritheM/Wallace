module.exports = function (admin) {
    admin.events.command_echo = function (message) {
        if (message.from.rank >= this.core.ranks.COHOST) {
            //TODO: change to new method once its created for determining source of message
            console.log(message);
            if (typeof message.from.plug !== "undefined") {
                this.plug.moderateDeleteChat(message.raw.cid);
            }
            var reply = message.args.join(" ");
            message.from.sendReply(reply);
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };
};