export default class PlugMessage {
    constructor(plugin, messageData) {
        this.plugin = plugin;

        this.message = messageData.message;
        this.cid = messageData.cid;

        this.from = this.plugin.room.getUserById(messageData.id);
        this.args = this.parseMessage(this.message);

        messageData.args = this.parseMessage(messageData.message);
    }

    delete() {
        this.plug.deleteMessage(this.cid);
    }

    parseMessage(message, options) {
        if (message == "") {
            return []; // :)
        }
        if (!options) {
            options = {};
        }
        options.keepquotes = options.keepquotes || false;
        options.quotes = options.quotes || true;
        options.users = options.users || true;

        function matchName(query, i, users) {
            let matches = [];
            for(let iuser in users) {
                if (!users.hasOwnProperty(iuser)) {
                    continue;
                }
                let user = users[iuser];

                let cmpname = user.username.split(" ").slice(0, i).join(" ");
                if (cmpname === query) {
                    matches.push(user);
                }
            }
            return matches;
        }

        let users = this.plugin.plug.getUsers();

        users.sort(function(a, b) {
            return b.username.length - a.username.length;
        });

        let parts = message.split(" ");
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];

            if (options.quotes && part[0] === "\"") {

                for (let j = 1; j <= 10 && i + j < parts.length; j++) {
                    console.log(part);
                    if (part[part.length - 1] === "\"") {

                        parts.splice(i + 1, j - 1);
                        if (options.keepquotes === true) {
                            parts[i] = part;
                        }
                        else {
                            parts[i] = part.substring(1, part.length - 1);
                        }

                        break;
                    }
                    part = part + " " + parts[i + j];
                }
            }

            else if (options.users && part[0] === "@") {
                part = part.slice(1);

                let matches = users;
                for (let j = 1; j <= 10 && i + j < parts.length; j++) {
                    matches = matchName(part, j, matches);

                    if (matches.length > 0) {
                        if (matches.length === 1) { //is this the name we're looking for?
                            if (matches[0].username === part) {
                                parts.splice(i + 1, j - 1);
                                parts[i] = "@" + part;
                            }
                        }
                    }
                    else {
                        break;
                    }

                    part = part + " " + parts[i + j];
                }

            }
        }
        return parts;
    }

    getUser(index) {
        if (this.args.length < index) {
            return undefined;
        }
        else if (this.args[index][0] !== "@") {
            return undefined;
        }
        else {
            return this.plugin.room.getUserByName(this.args[index].substring(1));
        }
    }
}