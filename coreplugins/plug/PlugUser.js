var PlugUser = function(user, plug) {
    this.user = user;
    this.plug = plug;
    
    //copy over user info
    for (var prop in user) {
        this[prop] = user[prop];
    }
    
    // rank is on a scale 0-100, whereas plug uses 0-5
    this.rank = user.role*20;
};

PlugUser.prototype.sendChat = function(message) {
    this.plug.sendChat(message);
}

PlugUser.prototype.sendReply = function(message) {
    this.plug.sendChat("[@"+this.user.username+"] "+message);
}


module.exports = PlugUser;