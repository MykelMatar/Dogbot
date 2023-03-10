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
            enlistStats: {
                enlists: Number,
                rejects: Number,
                ignores: Number,
                enlistXp: Number,
                enlistStreak: Number,
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
});

export default model("Guild", guildSchema);
