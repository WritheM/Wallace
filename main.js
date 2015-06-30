#!/usr/bin/env node

GLOBAL.BOTPLUGVERSION = "0.1.1-dev";
GLOBAL.PLUGIN_CONTRIBUTORS = [];

var Core = require("./core/Core.js");

GLOBAL.core = new Core();

