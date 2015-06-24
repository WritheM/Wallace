BotPlug
---

[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![GitHub issues](https://img.shields.io/github/issues/badges/shields.svg)]()
[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![Github Releases](https://img.shields.io/github/downloads/atom/atom/latest/total.svg)]()
[![Travis](https://img.shields.io/travis/joyent/node.svg)]()


Name change pending, read more and suggest your own via: http://wiki.writhem.com/pages/viewpage.action?pageId=4980797

---

Installation
---

    git clone https://github.com/WritheM/botPlug.git
    cd botPlug
    npm install

Configuration
---

1. Copy `config.json.dist` to `config.json`
2. Set the values inside the config, and configure any plugins data

Additional configuration options per plugin can be found in the README.md of the plugins directory.

Running
---

You can either just go to console and type `node main.js` or if you're on windows you can run one of the included bat files.

The `execute.bat` will only execute the bot, pause, then repeat.
The `PullAndStart.bat` will pull from git, update npm installs, Start the bot, then repeat. This is what we use in our production environment. If there is a crash, the bot updates from git, then restarts.