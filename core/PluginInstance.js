let fs = require("fs");
let EventHandler = require("./Plugin/EventHandler.js");

/**
 * @module Wallace
 */

/**
 * A base class for plugins to extend, this handles basics such as event binding, etc
 *
 * @class PluginInstance
 */
export default class PluginInstance {
    /**
     * takes in PluginLoader object for itself, sets up events, etc
     *
     * @constructor
     * @class PluginInstance
     * @param {PluginLoader} _plugin
     */
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


    /**
     * Was to allow loading in an entire directory, need to come up with a better approach
     *
     * @method loadDir
     * @param {String} path
     * @deprecated
     */
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


    /**
     * Default onLoad handler, instantiates attributes that allow access rest of wallace internals
     * (pluginloader, manager, core, config and logger)
     *
     * @method onLoad
     * @param {PluginInstance} _plugin PluginInstance
     */
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

    /**
     * Default onUnload handler, handle file unloading (as part of loadDir)
     *
     * @method onUnLoad
     */
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