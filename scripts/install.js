#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");
var async = require("async");

var plugin_dirs = ["coreplugins", "plugins",];

try {
    plugin_dirs = JSON.parse(fs.readFileSync("config.json")).core.paths;
}
catch (e) {
    console.log(e);
}

var dirs = [];

for (var i in plugin_dirs) {
    if (!plugin_dirs.hasOwnProperty(i)) {
        continue;
    }
    var dir = plugin_dirs[i];
    var files = fs.readdirSync(dir);
    for (var j in files) {
        if (!files.hasOwnProperty(j)) {
            continue;
        }
        var plugin = files[j];
        var cwd = path.resolve(dir + "/" + plugin);
        dirs.push(cwd);
    }
}

async.eachSeries(dirs, function (cwd, callback) {
    console.log("Installing " + cwd);

    var child = childProcess.spawn("npm", ["install"], {cwd: cwd});
    child.stdout.on("data", function (data) {
        process.stdout.write(data.toString());
    });
    child.stderr.on("data", function (data) {
        process.stdout.write(data.toString());
    });
    child.on("exit", function () {
        callback();
    });
});