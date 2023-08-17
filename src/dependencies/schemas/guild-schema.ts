import {model, Schema} from "mongoose";

const guildSchema = new Schema({
    guild: String,
    guildId: String,
    settings: {
        autoDetectIP: Boolean,
        fetchRole: String,
        timeZone: {
            offset: String,
            name: String
        }
    },
    userData: [
        {
            username: String,
            id: String,
            fetchStats: {
                enlists: Number,
                rejects: Number,
                perhaps: Number,
                ignores: Number,
                fetchXP: Number,
                fetchStreak: Number,
            },
            valorantProfile: {
                username: String,
                tag: String,
            },
            r6Profile: {
                username: String,
                platform: String,
            },
            predictionStats: {
                points: Number,
                correctPredictions: Number,
                incorrectPredictions: Number
            }
        },
    ],
    mcServerData: {
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
}, {timestamps: true});

export default model("guilds", guildSchema);
