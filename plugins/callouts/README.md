# callouts plugin for botPlug

This plugin provides you the ability to set a single or multiple scheduled messages that will be said on an interval you specify into your plug community.

# Configuration

Make sure to include the following in your config.json and customize as required.

    "callouts": {
        "shoutOutInterval": 60,
        "callouts": [
            "Welcome to the WritheM Radio Community! We are running \"BotPlug\", created by ylt and pironic, which is open source and located at https://gihub.com/WritheM/botPlug",
            "This is a second example of a callout for your community!"
        ],
        "permission": [
            "guest"
        ]
    }

# Commands

- !callouts: You can use this command to see how many callouts exist in rotation.

- !callouts view #: when you provide a number with the view argument, it will output the callout immediately. This will not reset the timer, so its just a manual way of viewing the callouts.

- !callout del #: this will allow the admins to remove a callout from rotation. There is no way to edit a callout, so you must remove existing ones and add new ones in order to edit them.

- !callout add <text>: everything provided after the add argument will be constructed and added to the callout rotation.
