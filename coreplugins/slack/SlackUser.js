let admins = ["ylt", "pironic"];

export default class SlackUser {
    constructor(user, slack) {
        this.user = user;
        this.slack = slack.slack;

        this.rank = 0;

        //no tidy way of doing this for now
        if (admins.indexOf(user.user_name) !== -1) {
            this.rank = 100;
        }
    }

    get username() {
        return this.user.user_name;
    }

    //TODO: options
    sendChat(message, options) {
        this.slack.notify({text: message});
    }

    sendReply(message, options) {
        this.sendChat("[<@" + this.user.user_id + ">] " + message, options)
    }

    /* TODO: remaining methods
    kick(reason, callback) {

    }

    ban(duration, reason, callback) {

    }

    setRole(role, callback) {

    }

    mute(time, reason, callback) {

    }

    removeMessages() {

    }
    */
}