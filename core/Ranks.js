function PermManager(core) {
    this.core = core;

    //TODO: make config based
    this.ranks = [
        new Rank("NORMAL", {
            "value": 0,
            "name": "Normal",
            "matches": ["normal", "user"]
        }),
        new Rank("RESIDENTDJ", {
            "value": 20,
            "name": "Resident DJ",
            "matches": ["residentdj", "resdj", "dj"]
        }),
        new Rank("BOUNCER", {
            "value": 40,
            "name": "Bouncer",
            "matches": ["bouncer", "mod"]
        }),
        new Rank("MANAGER", {
            "value": 60,
            "name": "Manager",
            "matches": ["manager", "admin"]
        }),
        new Rank("COHOST", {
            "value": 80,
            "name": "Co-Host",
            "matches": ["cohost", "co-host"]
        }),
        new Rank("HOST", {
            "value": 100,
            "name": "Host",
            "matches": ["host", "owner"]
        })
    ];

    this.ranks.sort(function (a, b) {
        if (a.value < b.value) {
            return -1;
        }
        else if (a.value > b.value) {
            return 1;
        }
        else {
            return 0;
        }
    });


    //for compatibility with old plugins
    for (let i = 0; i < this.ranks.length; i++) {
        let rank = this.ranks[i];
        this[rank.short] = rank.value;
    }
}

PermManager.prototype.getByValue = function (val) {
    //we want to find the highest "rank" that val fits into
    // for this, the most efficient technique is to go through backwards
    for (let i = this.ranks.length; i > 0; i--) {
        let rank = this.ranks[i];
        if (val > rank.value) {
            return rank;
        }
    }
};

PermManager.prototype.matchByName = function (name) {
    for (let i = 0; i < this.ranks.length; i++) {
        let rank = this.ranks[i];
        if (rank.isMatch(name)) {
            return rank;
        }
    }
};

function Rank(short, info) {
    this.short = short;
    this.value = info.value;
    this.name = info.name;
    this.matches = info.matches;
}

Rank.prototype.isMatch = function (name) {
    name = name.toLowerCase();
    if (name === this.short || name === this.name || this.matches.indexOf(name) !== -1) {
        return true;
    }
};

Rank.prototype.isWithin = function (value) {
    if (value instanceof Rank) {
        value = value.value;
    }

    if (value > this.value) {
        return true;
    }

};

module.exports = PermManager;