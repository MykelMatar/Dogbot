import {model, Schema} from "mongoose";
import {platforms} from "call-of-duty-api";

const guildSchema = new Schema({
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
            warzoneProfile: {
                username: String,
                platform: typeof platforms,
            },
            valorantProfile: {
                username: String,
                tag: String,
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

export default model("Guilds", guildSchema);
