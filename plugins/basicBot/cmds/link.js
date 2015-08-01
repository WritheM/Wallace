module.exports = function (basicBot) {
    basicBot.events.command_link = function (message) {
        if (message.from.rank >= this.core.ranks.RESIDENTDJ || this.plug.getDJ().id === message.from.id) {
            var media = this.plugged.getMedia();
            if (typeof media === "undefined") {
                message.from.sendReply("The link to the currently playing song is: http://youtu.be/dQw4w9WgXcQ", {emote:true});
            }
            else if (media.format === 1) {
                message.from.sendReply("The link to the currently playing song is: http://youtu.be/"+media.cid, {emote:true});
            }
            /*else if (media.format === 2) {
                // TODO: soundcloud api for link: https://developers.soundcloud.com/docs
                SC.get("/tracks/" + media.cid, function (sound) {
                    API.sendChat(subChat(basicBot.chat.songlink, {name: from, link: sound.permalink_url}));
                });
            }*/
            else {
                message.from.sendReply("The media format of this song is not supported yet.", {emote:true});
            }
        }
        else {
            message.from.sendReply("Command only available to DJs and staff", {emote:true});
        }
    };
};