/**
 * @module Wallace.Plugin
 */

export default function CommandHandler(name, opts) {
    opts = opts || {};

    return function (target, method, descriptor) {
        if (!name) {
            name = method;
        }
        if (!target.startevents) {
            target.startevents = [];
        }

        let event;
        if (opts.source) {
            event = opts.source + "_command_" + name;
        }
        else {
            event = "command_" + name;
        }

        let func;
        if (opts.rank) {
            func = function (messageData) { // `this` is equal to plugin class
                let required = this.core.ranks.matchByName(opts.rank);
                if (messageData.from.rank < required.value) {
                    let error = "You do not have permission ({access})";
                    if (opts.rankmsg) {
                        error = opts.rankmsg;
                    }

                    error = error.split("{access}").join(messageData.from.rank+"/"+required.value);

                    messageData.from.sendReply(error);
                }
                else {
                    //user has permission, call original func
                    descriptor.value.apply(this, arguments);
                }
            };
        }
        else {
            func = descriptor.value;
        }

        //same as EventHandler for now
        let events = target.startevents.slice();
        events.push({"event": event, "func": func});
        target.startevents = events;
    };
}