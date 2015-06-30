var admins = ["ylt", "pironic"];

var SlackUser = function (user, slack) {
    this.user = user;
    this.slack = slack.slack;

    this.rank = 0;

    //no tidy way of doing this for now
    if (admins.indexOf(user.user_name) !== -1) {
        this.rank = 100;
    }
};

SlackUser.prototype.sendChat = function (message) {
    this.slack.notify({text: message});
};

SlackUser.prototype.sendReply = function (message) {
    this.slack.notify({text: "[<@" + this.user.user_id + ">] " + message});
};

SlackUser.prototype.sendEmote = function (message) {
    this.slack.notify({text: "_[<@" + this.user.user_id + ">] " + message + " _"});
};

module.exports = SlackUser;