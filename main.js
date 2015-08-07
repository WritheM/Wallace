#!/usr/bin/env node

require("babel/register")({
    "stage": 1
});

var fs = require("fs");


GLOBAL.WALLACEVERSION = "Err";
GLOBAL.PLUGIN_CONTRIBUTORS = [];

try {
    var p = JSON.parse(fs.readFileSync(__dirname+"/package.json"));
    GLOBAL.WALLACEVERSION = p.version;
}
catch(e) {}

var Core = require("./core/Core.js");

process.on('uncaughtException', function (err) {
    console.error(err);
});

GLOBAL.core = new Core();

