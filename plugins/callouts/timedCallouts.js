var timedCallouts = {
    timeoutID: null,
    storedRequest: null
};

var events = {};

events.onLoad = function (plugin) {
    timedCallouts.config = plugin.getConfig();

    timedCallouts.scheduleShoutout();
    timedCallouts.storedRequest = plugin;
};

events.onUnload = function () {
    clearTimeout(timedCallouts.timeoutID);
    timedCallouts.timeoutID = null;
};

events.plug_command_callouts = function (request) {
    var sendChat = timedCallouts.storedRequest.manager.getPlugin("plug").plugin.plug.sendChat;

    if (request.from.role < 4) {
        request.from.sendEmote("Sorry you do not have access to this command.");
        return false;
    }

    if (request.args === undefined) {
        // output the current callout count
        sendChat("There are currently " + timedCallouts.config.callouts.length
        + " entries in the list of valid callouts. To see each, please type /callouts view #");
    }
    else {
        var args = request.args;
        if (args[0] == "view") {
            if (!isNaN(args[1])) {
                // rettrieve a certain number
                sendChat(timedCallouts.config.callouts[args[1] - 1]);
            }
            else {
                sendChat("Invalid callout number. The correct format for this command is /callouts view #");
            }
        }
        else if (args[0] == "add") {
            // add a callout
            args.splice(0, 1);
            var newCallout = args.join(' ');
            timedCallouts.config.callouts.push(newCallout);
            sendChat("Added a callout: " + newCallout);
        }
        else if (args[0] == "del") {
            if (!isNaN(args[1])) {
                // remove a callout
                timedCallouts.config.callouts.splice(args[1] - 1, 1);
                sendChat("Removed 1 callout.")
            }
            else {
                sendChat("Invalid callout number. The correct format for this command is /callouts del #");
            }
        }
        else {
            sendChat("That command was not understood. The valid commands for /callouts are view|add|del")
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

        var sendChat = timedCallouts.storedRequest.manager.getPlugin("plug").plugin.plug.sendChat;
        sendChat(message);
    }

    // Reschedule ourselves
    timedCallouts.scheduleShoutout();
};

module.exports = {
    "events": events
};
