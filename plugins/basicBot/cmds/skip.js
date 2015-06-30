module.exports = function (basicBot) {
    basicBot.events.command_skip = function (message) {
        var dj = this.plug.getDJ();
        if (typeof dj !== "undefined" && (message.from.rank >= this.core.ranks.BOUNCER || dj.id === message.from.id)) {
            this.plug.sendChat("/me [" + message.from.username+" used skip, it was very effective!]");
            this.plug.moderateForceSkip();

            //TODO: impelment timeout so it does things in the proper order.
            if (message.args.length !== 0) {
                this.plug.sendChat("/me @" + this.plug.getDJ().username+" "+ this.config.skip.reasons[message.args[0]]);
            }

        }
        else {
            message.from.sendEmote("Command only available to current DJ and staff, while there is someone in the DJ Booth");
        }
    };
};