const mongoose = require("mongoose");

const guildSchema = mongoose.Schema({
    guild: String,
    guildId: String,
    ServerData: {
        welcomeChannel: String,
        roles: {
            autoenlist: String,
            default: String,
        },
    },
    UserData: [
        {
            username: String,
            id: String,
            tttStats: {
                wins: Number,
                losses: Number,
            },
            enlistStats: {
                enlists: Number,
                rejects: Number,
            },
        },
    ],
    MCServerData: {
        serverList: [
            {
                name: String,
                ip: String,
            },
        ],
        selectedServer: {
            name: String,
            ip: String,
        },
    },
});

module.exports = mongoose.model("Guilds", guildSchema);
