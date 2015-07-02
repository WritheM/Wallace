# basicBot plugin for Wallace

This plugin provides you with most of the commands that come with [basicBot](https://github.com/Yemasthui/basicBot).

# Configuration

The configuration for this plugin are non-mandatory, meaning that shown below is the defaults and you only have to specify the values if you wish to over-ride the default configuration. If you want to override them, then they can be specified in your config.json file.

    "basicBot": {
        "add": {
            "permission": [
                "BOUNCER"
            ]
        },
        "ban": {
            "permission": [
                "BOUNCER"
            ]
        },
        "kick": {
            "permission": [
                "BOUNCER"
            ]
        },
        "link": {
            "permission": [
                "RESIDENTDJ"
            ]
        },
        "lock": {
            "permission": [
                "BOUNCER"
            ]
        },
        "logout": {
            "permission": [
                "COHOST"
            ]
        },
        "move": {
            "permission": [
                "BOUNCER"
            ]
        },
        "mute": {
            "permission": [
                "BOUNCER"
            ]
        },
        "ping": {
            "permission": [
                "BOUNCER"
            ]
        },
        "remove": {
            "permission": [
                "BOUNCER"
            ]
        },
        "skip": {
            "reasons": {
                "theme": "This song does not fit the room theme.",
                "op": "second example"
            },
            "permission": [
                "BOUNCER"
            ]
        },
        "unban": {
            "permission": [
                "BOUNCER"
            ]
        },
        "unlock": {
            "permission": [
                "BOUNCER"
            ]
        },
        "unmute": {
            "permission": [
                "BOUNCER"
            ]
        }
    }

# Commands

- !add @user : adds a user to the waitlist.

- !ban @user : bans a user for 1 hour.

- !kick @user : removes a user from the community.

- !link : provides the url to the media currently playing.

- !lock : will lock the wait list, preventing any non-staffers from joining it.

- !logout : will close the bot's session and log out.

- !move <position> @user : will move a user to the indicated position on the wait list.

- !mute @user : will prevent a user from chatting in your community for 1 hour.

- !ping : will provide with a pong response, and the access level of the user.

- !remove @user : will remove a user from the wait list.

- !skip _[reason]_ : will skip the currently playing song, and if a reason is provided, provide the text from the config associated with that reason code.

- !unban @user : will remove a user from the banned list.

- !unlock : will open the wait list and allow any non-staffers to join the wait list.

- !unmute @user : will allow a user that has been previously muted to chat again.
