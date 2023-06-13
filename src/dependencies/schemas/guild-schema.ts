import {model, Schema} from "mongoose";
import {platforms} from "call-of-duty-api";

const guildSchema = new Schema({
    guild: String,
    guildId: String,
    serverData: {
        welcomeChannel: String,
        roles: {
            autoenlist: String,
            default: String,
        },
    },
    userData: [
        {
            username: String,
            id: String,
            fetchStats: {
                enlists: Number,
                rejects: Number,
                ignores: Number,
                fetchXP: Number,
                fetchStreak: Number,
            },
            tttStats: {
                wins: Number,
                losses: Number,
            },
            warzoneProfile: {
                username: String,
                platform: {
                    type: String,
                    enum: platforms,
                },
            },
            valorantProfile: {
                username: String,
                tag: String,
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
