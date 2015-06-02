var plugin;
var events = {}

var plug;
var config;

events.onLoad = function(plugin) {
    config = plugin.GetConfig();

    var PlugAPI = require('plugapi');

    plug = new PlugAPI({
        email : config.auth.email,
        password : config.auth.password
    });

    plug.connect(config.auth.room);

    plug.on('roomJoin', eventproxy.roomJoin);

    for ( var i in PlugAPI.events) {
        var event = PlugAPI.events[i];
        if (!(event in eventproxy)) {
            // javascript closure abuse: -
            // goal is to have "event" defined and to also pass that into the event
            // function
            
            plug.on(event, function(event) {
                return function(arg) {
                    eventproxy.generic(event, arg);
                }(event);
            });
        }
    }
    
}

var eventproxy = {};

eventproxy.generic = function(event, arg) {
    //console.log("generic", event, arg);
}

eventproxy.roomJoin = function(room) {
    console.log("Joined " + room);
    plug.sendChat("Hello World");
}

module.exports = {
    "events" : events
};
