var fs = require("fs");
var PluginManager = require("./PluginManager.js");

global.__core = __dirname + "/";

var defaults = {
    "ranks": {
        "NORMAL": 0,
        "RESIDENTDJ": 20,
        "BOUNCER": 40,
        "MANAGER": 60,
        "COHOST": 80,
        "HOST": 100
    },
    "paths": ["coreplugins", "plugins"],
    "plugins": ["plug", "slack"],
    "logger": {
        "appenders": [{
            type: "console"
        }],
        "replaceConsole": true
    }
};

function Core() {
    Core.prototype.loadConfig();

    //TODO: make into class (issue #25)
    this.ranks = this.config.get("core.ranks");


    var log4js = require("log4js");
    log4js.configure(this.config.get("core.logger"));
    this.logger = log4js.getLogger();

    this.plugman = new PluginManager(this);
    this.plugman.start();
}

Core.prototype.loadConfig = function () {
    //new config follows same format as the old, so can just move it
    //TODO: remove in future
    try {
        var stats = fs.lstatSync("./config.json");

        if (stats.isFile()) {
            //make config dir if doesn't exist
            try {
                var dstats = fs.lstatSync("./config");
            }
            catch (e2) {
                fs.mkDirSync("./config");
            }

            fs.renameSync("./config/local.json")
        }
    }
    catch (e) {
        console.log(e);
    }

    this.config = require("config");
    this.config.util.setModuleDefaults("core", defaults);
    console.log(this.config);
};

Core.prototype.saveConfig = function () {
    fs.writeFileSync("config.json", JSON.stringify(this.config, null, 4), "utf8");
};

module.exports = Core;