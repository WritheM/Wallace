Wallace
---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/WritheM/Wallace/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/npm.svg)](https://github.com/WritheM/Wallace/#requirements)
[![node.js](https://img.shields.io/node/v/gh-badges.svg)](https://github.com/WritheM/Wallace/#requirements)
[![Github Releases](https://img.shields.io/github/release/WritheM/Wallace.svg)](https://github.com/WritheM/Wallace/releases)
[![Codacy](https://img.shields.io/codacy/ce11553d61ea42bbbdbe96930c20de06.svg)](https://www.codacy.com/app/WritheM/Wallace)
[![GitHub issues](https://img.shields.io/github/issues/WritheM/Wallace.svg)](https://github.com/WritheM/Wallace/issues)
[![Travis](https://img.shields.io/travis/WritheM/Wallace.svg)](https://travis-ci.org/WritheM/Wallace)

---

Installation
---

    git clone https://github.com/WritheM/Wallace.git
    cd Wallace
    npm install

Requirements
---

npm should install these for you, but it's always nice to know what you need. For starters, node.js must be higher than version 0.10.

- "plugapi": "WritheM/PlugAPI"
- "node-slackr": ">=0.1.0"
- "log4js": ">=0.6.25"
- "request": ">=2.58.0"
- "config": ">=1.14.0"

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