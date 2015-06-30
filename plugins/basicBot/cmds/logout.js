module.exports = function (basicBot) {
    basicBot.events.command_logout = function (message) {
        if (message.from.rank >= this.core.ranks.COHOST) {
            message.from.sendEmote("Exiting now!");
            setTimeout(function () {
                process.exit();
            }, 1000);
        }
        else {
            message.from.sendEmote("Command only available to users with access levels equal to or higher than "+this.core.ranks.MANAGER);
        }
    };
};