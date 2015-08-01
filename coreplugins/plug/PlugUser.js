class PlugUser {
    constructor(plugin, user) {
        this.user = user;
        this.plugin = plugin;
        this.plug = plugin.plug;
        this.room = plugin.room;

        //copy over user info
        for (var prop in user) {
            this[prop] = user[prop];
        }

        // rank is on a scale 0-100, whereas plug uses 0-5
        this.rank = (user.role || 0) * 20;
    }

    sendChat(message, options) {
        this.room.sendChat(message, options);
    }

    sendReply(message, options) {
        this.room.sendChat("[@" + this.username + "] " + message, options);
    }

    kick(reason, callback) {
        var plug = this.plug;
        var that = this;
        reason = reason || plug.BANREASON.VIOLATING_COMMUNITY_RULES;

        //unban callback is unreliable,

        var unban = function () {
            console.log("unbanning");
            plug.unbanUser(that.id, function () {
            });
        };

        plug.banUser(this.id, "h", reason, function () {
            clearTimeout(unban);
            setTimeout(unban, 5 * 1000);
        });

        setTimeout(unban, 60 * 1000);
    }

    ban(duration, reason, callback) {
        var plug = this.plug;
        duration = duration || plug.BANDURATION.HOUR;
        reason = reason || plugBANREASON.VIOLATING_COMMUNITY_RULES;

        plug.banUser(this.id, duration, reason, callback);
    }

    setRole(role, callback) {
        var plug = this.plug;
        role = role || plug.USERROLE.NONE;

        if (role === plug.USERROLE.NONE) {
            plug.removeStaff(this.id, callback);
        }
        else {
            plug.addStaff(this.id, role, callback);
        }
    }


    mute(time, reason, callback) {
        var plug = this.plug;
        reason = reason || 1; //TODO: add lookup table
        time = time || plug.MUTE_DURATION.NONE;

        if (time == plug.MUTE_DURATION.NONE) {
            plug.unmuteUser(this.id, callback);
        }
        else {
            plug.muteUser(this.id, time, reason, callback);
        }
    }

    addToWaitlist(callback) {
        //"add"ing self to waitlist makes message in chat
        // so just "join".
        if (this.id === this.plug.getSelf().id) {
            this.plug.joinWaitlist(callback);
        }
        else {
            this.plug.addToWaitlist(this.id, callback);
        }
    }


    removeWaitlist(callback) {
        //ditto ^
        callback = callback || function () {
        };

        if (this.id === this.plug.getSelf().id) {
            this.plug.leaveWaitlist(callback);
        }
        else {
            this.plug.removeDJ(this.id, callback);
        }
    }

    moveDJ(position, callback) {
        var oldpos = this.getWaitlistPosition();
        if (oldpos && oldpos !== position) {
            this.plug.moveDJ(this.id, callback);
        }
    }

    removeMessages() {
        this.plug.removeChatMessagesByUser(this.id);
    }

    isFriend() {
        return this.plug.isFriend(this.id);
    }

    isCurrentDJ() {
        var dj = this.plug.getCurrentDJ();
        if (dj === null) {
            return false;
        }
        return dj.id === this.id;
    }

    getWaitlistPosition() {
        var waitlist = this.plug.getWaitlist();
        for (var i in waitlist) {
            if (!waitlist.hasOwnProperty(i)) {
                continue;
            }
            var user = waitlist[i];

            if (user.id === this.id) {
                return i;
            }
        }
        ;
        return undefined;
    }

    isInWaitlist() {
        return this.getWaitlistPosition() != undefined;
    }
}

module.exports = PlugUser;