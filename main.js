#!/usr/bin/env node

GLOBAL.BOTPLUGVERSION = '0.0.1';

var PluginManager = require("./core/PluginManager.js");

plugman = new PluginManager();
plugman.start();