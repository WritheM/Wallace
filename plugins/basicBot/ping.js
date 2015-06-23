var PluginInstance = require(__core + "PluginInstance.js");

var basicBot = new PluginInstance();

// http://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
basicBot.randmsg = ["Destination network unreachable", "Destination host unreachable", "Destination host unknown"];

basicBot.events.command_ping = function (message) {
    var rand = Math.floor(Math.random() * 10);

    var response = "pong!";

    if (rand == 0) {
        response = this.randmsg[Math.floor(Math.random() * randmsg.length)];
    }
    
    message.from.sendReply(response);
};


basicBot.events.command_link = function (message) {
    if (message.from.rank >= this.core.ranks.RESIDENTDJ || plug.getDJ().id == message.from.id) {
        var media = plug.getMedia();
        if (media.format == 1) {
            message.from.sendReply("http://youtu.be/"+media.cid);
        }
        else {
            message.from.sendReply("Soundcloud not supported yet");
        }
    }
    else {
        message.from.sendReply("Command only available to DJ's and staff");
    }
};

basicBot.events.command_ban = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_unban = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_kick = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};
basicBot.events.command_mute = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_unmute = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_add = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};
basicBot.events.command_remove = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};
basicBot.events.command_move = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_skip = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

basicBot.events.command_lock = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};
basicBot.events.command_unlock = function (message) {
    if (message.from.rank >= this.core.ranks.BOUNCER) {

    }
    else {
        message.from.sendReply("Command only available to staff");
    }
};

module.exports = basicBot;