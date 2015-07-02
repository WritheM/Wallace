#!/usr/bin/env node

GLOBAL.WALLACEVERSION = "0.1.5-beta";
GLOBAL.PLUGIN_CONTRIBUTORS = [];

var Core = require("./core/Core.js");

GLOBAL.core = new Core();

