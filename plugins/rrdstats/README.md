# rrdstats plugin for botPlug

This plugin provides the basic stats of the broadcast to your preconfigured RRD API.

This plugin will rely on the RRD API module provided as part of the GSBOT-php-lib located at: https://github.com/WritheM/GSBOT-php-lib

The url of this API will be internally accessible only and locked down tightly.

# Configuration

Make sure to include the following in your config.json

    "rrdstats": {
        "url": "http://10.1.1.3:81/wolfram/?q="
    }
