let PluginInstance = require(__core + "PluginInstance.js");
let EventHandler = require(__core + "Plugin/EventHandler.js");

let Sequelize = require("sequelize");

export default class History extends PluginInstance {
    init() {
        this.plug = this.manager.getPlugin("plug"); //TODO: implement better method

        this.sequelize = new Sequelize(this.config.uri);

        this.dbPlay = this.sequelize.define("Play", {
                media_id: Sequelize.STRING,
                plug_id: Sequelize.INTEGER,
                duration: Sequelize.INTEGER,
                format: Sequelize.INTEGER,
                author: Sequelize.STRING,
                title: Sequelize.STRING,
                image: Sequelize.STRING,
                timestamp: Sequelize.DATE,
                history_id: Sequelize.STRING,
                playlist_id: Sequelize.INTEGER
            },
            {
                underscored: true
            });

        this.dbUser = this.sequelize.define("User", {
                //plug_id: { type: Sequelize.INTEGER, primaryKey: true },
                username: Sequelize.STRING,
                slug: Sequelize.STRING,
                level: Sequelize.INTEGER,
                language: Sequelize.STRING,
                joined: Sequelize.DATE,
                badge: Sequelize.STRING,
                avatar: Sequelize.STRING,
                sub: Sequelize.INTEGER,
                gRole: Sequelize.INTEGER
            },
            {
                underscored: true
            });

        this.dbVote = this.sequelize.define("Vote", {
                woot: Sequelize.BOOLEAN,
                grab: Sequelize.BOOLEAN,
                meh: Sequelize.BOOLEAN,
                delay: Sequelize.INTEGER,
                val: Sequelize.FLOAT
            },
            {
                underscored: true
            });

        //Play has a DJ
        this.dbPlay.belongsTo(this.dbUser, {as: "dj"});

        //Play has a vote list
        this.dbPlay.hasMany(this.dbVote);
        //But the votes also have a backreference to the play
        this.dbVote.belongsTo(this.dbPlay);

        //Each vote has a user
        this.dbVote.belongsTo(this.dbUser);
        //But each user also has many votes
        this.dbUser.hasMany(this.dbVote);

        this.sequelize.sync().then(() => {
            if (this.plug.room) {
                this.joinedRoom();
            }
        });
    }

    @EventHandler("plug_joinedRoom")
    joinedRoom() {
        this.initVotes();

        var users = this.plug.room.getUsers();
        for (let user in users) {
            this.updateUser(users[user]);
        }
    }

    @EventHandler("plug_userUpdate")
    @EventHandler("plug_userJoin")
    updateUserEvent(user) {
        user = this.plug.room.getUserById(user.id);
        this.updateUser(user);
    }

    updateUser(user) {
        var vals = {
            id: user.id,
            username: user.username,
            //slug: user.slug,
            level: user.level,
            language: user.language,
            joined: user.joined,
            //badge: user.badge,
            avatar: user.avatarID,
            sub: user.sub,
            gRole: user.gRole
        };
        if (user.slug) {
            vals.slug = user.slug;
        }
        if (user.badge) {
            vals.badge = user.badge;
        }

        this.dbUser.findOrBuild({where: {id: user.id}}).spread((u, created) => {
            u.updateAttributes(vals);
            u.save();
        });


        if (!this.votes[user.id]) {
            this.constructVote(user.id);
        }
    }

    constructVote(uid) {
        this.votes[uid] = this.dbVote.build({
            woot: false,
            grab: false,
            meh: false,
            delay: null,
            val: 0,
            user_id: uid
        });
    }

    @EventHandler()
    plug_vote(vote) {
        let uid = vote.id;
        let direction = vote.direction;

        if (!this.votes[uid]) {
            this.constructVote(uid);
        }

        this.votes[uid].woot = direction>0;
        this.votes[uid].meh = direction<0;

        var time = new Date(this.plug.plug.getStartTime().replace(" ", "T")+"z");
        if (!isNaN(time)) {
            this.votes[uid].delay = new Date() - time;
        }
    }

    @EventHandler()
    plug_grab(uid) {
        if (!this.votes[uid]) {
            this.constructVote(uid);
        }

        this.votes[uid].grab = true;

        var time = new Date(this.plug.plug.getStartTime().replace(" ", "T")+"z");
        if (!isNaN(time)) {
            this.votes[uid].delay = new Date() - time;
        }
    }

    initVotes() {
        this.votes = {};
        let users = this.plug.room.getUsers();
        for(let i in users) {
            let user = users[i];
            this.constructVote(user.id);
        }


        //we could construct vote objects beyond this point
        // but not going to as its such an edge case (only has use on startup)
        let votes = this.plug.plug.getVotes();
        for(let i in votes) {
            let vote = votes[i];
            let uid = vote.id;
            let direction = vote.direction;
            if (this.votes[uid]) {
                this.votes[uid].woot = direction > 0;
                this.votes[uid].meh = direction < 0;
            }
        }

        let grabs = this.plug.plug.getGrabs();
        for(let i in grabs) {
            let uid = grabs[i];
            if (this.votes[uid]) {
                this.votes[uid].grab = true;
            }
        }
    }

    @EventHandler("plug_advance")
    advance(advance) {
        let votes = this.votes || {};
        this.initVotes();

        let media = advance.lastPlay.media;
        this.dbPlay.create({
            media_id: media.cid,
            plug_id: media.id,
            duration: media.duration,
            format: media.format,
            author: media.author,
            title: media.title,
            image: media.image,
            timestamp: new Date(),
            history_id: advance.lastPlay.historyID,
            playlist_id: -1,
            dj_id: advance.lastPlay.dj.id
        }).then((play) => {
            for(let i in votes) {
                let vote = votes[i];
                vote.play_id = play.id;
                vote.save();
            }
        });
    }
}


