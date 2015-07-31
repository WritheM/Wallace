#!/usr/bin/env node

GLOBAL.WALLACEVERSION = "Err";
GLOBAL.PLUGIN_CONTRIBUTORS = [];


var fs = require("fs");

try {
    var p = JSON.parse(fs.readFileSync(__dirname+"/package.json"));
    GLOBAL.WALLACEVERSION = p.version;
}
catch(e) {}

var Core = require("./core/Core.js");

GLOBAL.core = new Core();

