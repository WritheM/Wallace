var PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

export default class TimedCallouts extends PluginInstance {
    init(plugin) {
        this.timeoutID = null;

        this.plugged = this.manager.getPlugin("plug").plug; //TODO: implement better method
        this.plug = this.manager.getPlugin("plug");

        this.scheduleShoutout();
    }

    @EventHandler()
    onUnload() {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;

        PluginInstance.prototype.onUnload.call(this);
    }

    @EventHandler()
    command_callouts(message) {
        if (message.from.role < 4) {
            message.from.sendReply("Sorry you do not have access to this command.", {emote: true});
            return false;
        }

        if (message.args.length === 0) {
            // output the current callout count
            message.from.sendReply("There are currently " + this.config.callouts.length
            + " entries in the list of valid callouts. To see each, please type /callouts view #", {emote: true});
        }
        else {
            var args = message.args;
            if (args[0] === "view") {
                if (!isNaN(args[1])) {
                    // rettrieve a certain number
                    message.from.sendReply(this.config.callouts[args[1] - 1], {emote: true});
                }
                else {
                    message.from.sendReply("Invalid callout number. The correct format for this command is /callouts view #", {emote: true});
                }
            }
            else if (args[0] === "add") {
                // add a callout
                args.splice(0, 1);
                var newCallout = args.join(" ");
                this.config.callouts.push(newCallout);
                message.from.sendReply("Added a callout: " + newCallout, {emote: true});
            }
            else if (args[0] === "del") {
                if (!isNaN(args[1])) {
                    // remove a callout
                    this.config.callouts.splice(args[1] - 1, 1);
                    message.from.sendReply("Removed 1 callout.", {emote: true});
                }
                else {
                    message.from.sendReply("Invalid callout number. The correct format for this command is /callouts del #", {emote: true});
                }
            }
            else {
                message.from.sendReply("That command was not understood. The valid commands for /callouts are view|add|del", {emote: true});
            }
        }

    };

    scheduleShoutout() {
        if (this.timeoutID !== null) {
            // We've got a timeout scheduled already, let's clear it.
            clearTimeout(this.timeoutID);
        }

        var shoutOutInterval = this.config.shoutOutInterval * 1000 * 60; // Conversion
        // from
        // minutes
        // ->
        // milliseconds

        // Schedule a single timeout
        this.timeoutID = setTimeout(this.doShoutout.bind(this), shoutOutInterval);
    }
    doShoutout() {
        // The timeout has executed, we don't need the handle anymore.
        this.timeoutID = null;

        var message = this.config.callouts[Math.floor(Math.random() * this.config.callouts.length)];
        if (message && message.trim().length) {
            console.log("scheduledShoutout: " + message);

            this.plug.room.sendChat(message);
        }

        // Reschedule ourselves
        this.scheduleShoutout();
    }
}