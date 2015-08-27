/**
 * @module Plug
 */

/**
 * @class PlugUser
 */
class PlugUser {
    /**
     * @class PlugUser
     * @constructor
     * @param plugin
     * @param user
     */
    constructor(plugin, user) {
        this.user = user;
        this.plugin = plugin;
        this.plug = plugin.plug;
        this.room = plugin.room;

        //copy over user info
        for (let prop in user) {
            this[prop] = user[prop];
        }

        // rank is on a scale 0-100, whereas plug uses 0-5
        this.rank = (user.role || 0) * 20;
    }

    /**
     * @method sendChat
     * @param message
     * @param options
     */
    sendChat(message, options) {
        this.room.sendChat(message, options);
    }

    /**
     * @method sendReply
     * @param message
     * @param options
     */
    sendReply(message, options) {
        this.room.sendChat("[@" + this.username + "] " + message, options);
    }

    /**
     * @method kick
     * @param reason
     * @param callback
     */
    kick(reason, callback) {
        let plug = this.plug;
        let that = this;
        reason = reason || plug.BANREASON.VIOLATING_COMMUNITY_RULES;

        //unban callback is unreliable,

        let unban = function () {
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

    /**
     * @method ban
     * @param duration
     * @param reason
     * @param callback
     */
    ban(duration, reason, callback) {
        let plug = this.plug;
        duration = duration || plug.BANDURATION.HOUR;
        reason = reason || plug.BANREASON.VIOLATING_COMMUNITY_RULES;

        plug.banUser(this.id, duration, reason, callback);
    }

    /**
     * @method setRole
     * @param role
     * @param callback
     */
    setRole(role, callback) {
        let plug = this.plug;
        role = role || plug.USERROLE.NONE;

        if (role === plug.USERROLE.NONE) {
            plug.removeStaff(this.id, callback);
        }
        else {
            plug.addStaff(this.id, role, callback);
        }
    }

    /**
     * @method mute
     * @param time
     * @param reason
     * @param callback
     */
    mute(time, reason, callback) {
        let plug = this.plug;
        reason = reason || 1; //TODO: add lookup table
        time = time || plug.MUTE_DURATION.NONE;

        if (time == plug.MUTE_DURATION.NONE) {
            plug.unmuteUser(this.id, callback);
        }
        else {
            plug.muteUser(this.id, time, reason, callback);
        }
    }

    /**
     * @method addToWaitlist
     * @param callback
     */
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


    /**
     * @method removeWaitlist
     * @param callback
     */
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

    /**
     * @method moveDJ
     * @param position
     * @param callback
     */
    moveDJ(position, callback) {
        let oldpos = this.getWaitlistPosition();
        if (oldpos && oldpos !== position) {
            this.plug.moveDJ(this.id, callback);
        }
    }

    /**
     * @method removeMessages
     */
    removeMessages() {
        this.plug.removeChatMessagesByUser(this.id);
    }

    /**
     * @method isFriend
     * @returns {boolean}
     */
    isFriend() {
        return this.plug.isFriend(this.id);
    }

    /**
     * @method isCurrentDJ
     * @returns {boolean}
     */
    isCurrentDJ() {
        let dj = this.plug.getCurrentDJ();
        if (dj === null) {
            return false;
        }
        return dj.id === this.id;
    }

    /**
     * @method skipDJ
     * @param callback
     * @returns {*}
     */
    skipDJ(callback) {
        return this.plug.skipDJ(this.id, callback);
    }

    /**
     * @method getWaitlistPosition
     * @returns {int}
     */
    getWaitlistPosition() {
        let waitlist = this.plug.getWaitlist();
        for (let i in waitlist) {
            if (!waitlist.hasOwnProperty(i)) {
                continue;
            }
            let user = waitlist[i];

            if (user.id === this.id) {
                return i;
            }
        }
        return undefined;
    }

    /**
     * @method isInWaitlist
     * @returns {boolean}
     */
    isInWaitlist() {
        return this.getWaitlistPosition() != undefined;
    }
}

module.exports = PlugUser;