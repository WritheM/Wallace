# wolfram|alpha plugin for botPlug

This plugin provides your users the ability to query wolfram|alpha for information from it's database as well as provide some of your own answers, as defined in easter.php.

This plugin will rely on the wolfram module provided as part of the GSBOT-php-lib located at: https://github.com/WritheM/GSBOT-php-lib

Hard boiled eggs are looked up first. If a match is found, no hits to wolfram are made.
Soft boiled eggs are looked up only if there no match found on wolfram.

# Configuration

Make sure to include the following in your config.json

    "wa": {
        "url": "http://10.1.1.3:81/wolfram/?q="
    }

# Commands

users can query wolfram by issuing a !wa <input> command. The plugin will query the script and return results as they are found. This means that sometimes some questions are answered faster than others.