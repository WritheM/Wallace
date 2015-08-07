module.exports = function (basicBot) {
    basicBot.events.command_skip = function (message) {
        var dj = this.plug.getCurrentDJ();
        if (typeof dj !== "undefined" && (message.from.rank >= this.core.ranks.BOUNCER || dj.id === message.from.id)) {
            this.plug.room.sendChat("/me [" + message.from.username+" used skip, it was very effective!]");
            this.plug.skipDJ(dj);

            //TODO: implement timeout so it does things in the proper order.
            if (message.args.length !== 0) {
                this.plug.room.sendChat("/me @" + this.plug.getDJ().username+" "+ this.config.skip.reasons[message.args[0]]);
            }

        }
        else {
            message.from.sendReply("Command only available to current DJ and staff, while there is someone in the DJ Booth", {emote: true});
        }
    };
};