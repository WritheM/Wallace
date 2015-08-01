module.exports = function (basicBot) {

    // http://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
    basicBot.randmsg = ["Destination network unreachable", "Destination host unreachable", "Destination host unknown"];

    basicBot.events.command_ping = function (message) {
		if (message.from.rank >= this.core.ranks.BOUNCER) {
			var rand = Math.floor(Math.random() * 10);

			var response = "Pong! Your access level is currently: " + message.from.rank.toString();

			if (rand === 0) {
				response = this.randmsg[Math.floor(Math.random() * this.randmsg.length)];
			}

			message.from.sendReply(response, {emote: true});
		}
		else {
			message.from.sendReply("Command only available to staff", {emote:true});
		}
    };
};