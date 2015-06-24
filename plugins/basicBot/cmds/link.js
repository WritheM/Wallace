module.exports = function (basicBot) {
    basicBot.events.command_link = function (message) {
        if (message.from.rank >= this.core.ranks.RESIDENTDJ || this.plug.getDJ().id === message.from.id) {
            var media = this.plug.getMedia();
            if (typeof media === 'undefined') {
                message.from.sendEmote("The link to the currently playing song is: http://youtu.be/dQw4w9WgXcQ")
            }
            else if (media.format === 1) {
                message.from.sendEmote("The link to the currently playing song is: http://youtu.be/"+media.cid);
            }
            /*else if (media.format === 2) {
                // TODO: soundcloud api for link: https://developers.soundcloud.com/docs
                SC.get('/tracks/' + media.cid, function (sound) {
                    API.sendChat(subChat(basicBot.chat.songlink, {name: from, link: sound.permalink_url}));
                });
            }*/
            else {
                message.from.sendEmote("The media format of this song is not supported yet.");
            }
        }
        else {
            message.from.sendEmote("Command only available to DJ's and staff");
        }
    };
};