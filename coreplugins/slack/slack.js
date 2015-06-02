var plugin;

var events = {}

events.onLoad = function(plugin) {
	//dependency injection, any better methods for Node?
	this.plugin = plugin;

	console.log("Slack Loaded");
}

events.onUnload = function() {
}

events.plug_onJoin = function(user) {
}

events.plug_onMessage = function(user, chatMessage) {
}

module.exports = {"events": events};
