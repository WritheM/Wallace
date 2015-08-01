function PlugMedia(plugin, media) {
    this.plugin = plugin;
    this.media = media;
    //this.info; youtube/soundcloud info


}

//not tested:
var keys = ["author", "cid", "duration", "format", "id", "image", "title"];
for(var i in keys) {
    if (!keys.hasOwnProperty(i)) {
        continue;
    }
    var key = keys[i];
    (function(key) {
        Object.defineProperty(PlugMedia, key, {
            get: function() {
                return this.media[key];
            },
            set: function(value) {
                this.media[key] = value;
            }
        });
    })(key);
}

