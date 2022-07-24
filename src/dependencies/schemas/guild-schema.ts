import mongoose from "mongoose";

const guildSchema = new mongoose.Schema({
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
            enlistStats: {
                enlists: Number,
                rejects: Number,
                ignores: Number, 
            },
            tttStats: {
                wins: Number,
                losses: Number,
            },
            typingRaceStats: {
                AverageWPM: Number,
                AverageRawWPM: Number,
                AverageAccuracy: Number,
                FirstPlaceWins: Number,
            }
        },
    ],
    MCServerData: {
        serverList: [
            {
                name: String,
                ip: String,
                port: Number
            },
        ],
        selectedServer: {
            name: String,
            ip: String,
            port: Number
        },
    },
});

export default mongoose.model("Guilds", guildSchema);
