let fs = require("fs");
let EventHandler = require("./Plugin/EventHandler.js");

export default class PluginInstance {
    constructor(_plugin) {
        this.pinst = this;
        this.files = [];
        this.events = {};


        for (let i in this.startevents) {
            if (this.startevents.hasOwnProperty(i)) {
                //this.events[k] = this.startevents[k];
                let event = this.startevents[i];
                this.events[event.event] = event.func;

            }
        }
        //console.log(events, this.events);

        /*if (_plugin) {
            this.onLoad(_plugin);
        }*/
    }

    loadDir(path) {
        let files = fs.readdirSync(path);
        for (let i = 0; i < files.length; i++) {
            let file = path + "/" + files[i];
            let name = require.resolve(file);
            this.files.push(name);

            //small hack, try unloading before loading
            // in case of error/plugin not unloading properly
            try {
                delete require.cache[name];
            }
            catch (e) {

            }

            require(file)(this);
        }
    }

    @EventHandler()
    onLoad(_plugin) {
        this.plugin = _plugin;
        this.manager = _plugin.manager;
        this.core = this.manager.core;
        this.config = _plugin.getConfig();
        this.logger = this.core.log4js.getLogger(_plugin.meta.name);

        if (this.init) {
            this.init();
        }
    }

    @EventHandler()
    onUnload() {
        for (let i = 0; i < this.files.length; i++) {
            let name = this.files[i];
            try {
                delete require.cache[name];
            }
            catch (e) {

            }
        }
    }
}