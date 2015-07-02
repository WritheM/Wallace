# Plugin Manager for Wallace

This plugin provides you with the ability to load/unload and refresh plugins from any of the services the bot resides in.

# Configuration

The configuration for this plugin are non-mandatory, meaning that shown below is the defaults and you only have to specify the values if you wish to over-ride the default configuration. If you want to override them, then they can be specified in your config.json file.

    "plugman": {
        "permission": [
            "MANAGER"
        ]
    }

# Commands

- !plugins list : will list all of the plugins that are available and what state they are in.

- !plugins refresh : will refresh the list of plugins from disk and unload any plugins that are no longer on the disk.

- !plugin load _[name]_ : will load the desired plugin.

- !plugin unload _[name]_ : i'll only give you one guess to what this does.

- !plugin reload _[name]_ : will unload, and then, you guessed it, load the plugin!
