# admin plugin for Wallace

This plugin provides you and your staff abilities to control the plug community via the bot. This means that you can now control the plug community from any service the bot is located in.

# Configuration

The configuration for this plugin are non-mandatory, meaning that shown below is the defaults and you only have to specify the values if you wish to over-ride the default configuration. If you want to override them, then they can be specified in your config.json file.

    "admin": {
        "echo": {
            "permission": [
                "COHOST"
            ]
        },
        "say": {
            "permission": [
                "BOUNCER"
            ]
        }
    }

# Commands

- !echo [message] : will remove the command used to execute this, then say the arguments as if the bot said them originally.

- !say [message] : will remove the command used to execute this, then speak on behalf of you to your community via the bot.