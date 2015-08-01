var PluginInstance = require(__core + "PluginInstance.js");

var timedCallouts = new PluginInstance();

timedCallouts.vars = {
    timeoutID: null,
    storedRequest: null
};

timedCallouts.init = function (plugin) {
    timedCallouts.scheduleShoutout();
    timedCallouts.storedRequest = plugin;
};

timedCallouts.events.onUnload = function () {
    clearTimeout(timedCallouts.timeoutID);
    timedCallouts.timeoutID = null;

    PluginInstance.prototype.onUnload.call(this);
};

timedCallouts.events.command_callouts = function (message) {
    if (message.from.role < 4) {
        message.from.sendReply("Sorry you do not have access to this command.", {emote:true});
        return false;
    }

    console.log(message.args.length);

    if (message.args.length === 0) {
        // output the current callout count
        message.from.sendReply("There are currently " + timedCallouts.config.callouts.length
        + " entries in the list of valid callouts. To see each, please type /callouts view #", {emote:true});
    }
    else {
        var args = message.args;
        if (args[0] === "view") {
            if (!isNaN(args[1])) {
                // rettrieve a certain number
                message.from.sendReply(timedCallouts.config.callouts[args[1] - 1], {emote:true});
            }
            else {
                message.from.sendReply("Invalid callout number. The correct format for this command is /callouts view #", {emote:true});
            }
        }
        else if (args[0] === "add") {
            // add a callout
            args.splice(0, 1);
            var newCallout = args.join(" ");
            timedCallouts.config.callouts.push(newCallout);
            message.from.sendReply("Added a callout: " + newCallout, {emote:true});
        }
        else if (args[0] === "del") {
            if (!isNaN(args[1])) {
                // remove a callout
                timedCallouts.config.callouts.splice(args[1] - 1, 1);
                message.from.sendReply("Removed 1 callout.", {emote:true});
            }
            else {
                message.from.sendReply("Invalid callout number. The correct format for this command is /callouts del #", {emote:true});
            }
        }
        else {
            message.from.sendReply("That command was not understood. The valid commands for /callouts are view|add|del", {emote:true});
        }
    }

};

timedCallouts.scheduleShoutout = function () {
    if (timedCallouts.timeoutID !== null) {
        // We've got a timeout scheduled already, let's clear it.
        clearTimeout(timedCallouts.timeoutID);
    }

    var shoutOutInterval = timedCallouts.config.shoutOutInterval * 1000 * 60; // Conversion
    // from
    // minutes
    // ->
    // milliseconds

    // Schedule a single timeout
    timedCallouts.timeoutID = setTimeout(timedCallouts.doShoutout, shoutOutInterval);
};
timedCallouts.doShoutout = function () {
    // The timeout has executed, we don't need the handle anymore.
    timedCallouts.timeoutID = null;

    var message = timedCallouts.config.callouts[Math.floor(Math.random() * timedCallouts.config.callouts.length)];
    if (message && message.trim().length) {
        console.log("scheduledShoutout: " + message);

        var sendChat = timedCallouts.storedRequest.manager.getPlugin("plug").room.sendChat;
        sendChat(message);
    }

    // Reschedule ourselves
    timedCallouts.scheduleShoutout();
};

module.exports = timedCallouts;
