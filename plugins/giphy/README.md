# gifphy plugin for botPlug

This plugin provides your users the ability to query giphy.com for a random gif or the gif with the tags they specify.

# Configuration

The configuration for this plugin are non-mandatory, meaning that shown below is the defaults and you only have to specify the values if you wish to over-ride the default configuration. If you want to override them, then they can be specified in your config.json file.

    "giphy": {
        "api_key": "dc6zaTOxFJmzC",
        "rating": "pg-13",
        "url": "http://api.giphy.com/v1/gifs/random",
        "permission": ["guest"]
    },

# Commands

users can query giphy by issuing a !gif <input> command. The plugin will query the script and return results as they are found. This means that sometimes some queries are returned faster than others.