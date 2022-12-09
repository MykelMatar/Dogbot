import DiscordJS from "discord.js";
import {platforms} from "call-of-duty-api";

export type newClient = DiscordJS.Client & {
    commands: DiscordJS.Collection<string,any> // allows commands to be bound to the client instance for global retrieval
}

// Interface to hold stats for users displayed on the enlist-leaderboard
export interface leaderboardUser {
    name: string,
    enlists: number,
    rejects: number,
    enlistPercentage: number
    rejectPercentage: number
    adjustedEnlistRankValue: number
    adjustedRejectRankValue: number
}

export interface guild { // mongoose schema interface
    guild: string,
    guildId: string,
    ServerData: {
        welcomeChannel: string,
        roles: {
            autoenlist: string,
            default: string,
        },
    },
    UserData: [
        {
            username: string,
            id: string,
            enlistStats: {
                enlists: number,
                rejects: number,
                ignores: number,
            },
            tttStats: {
                wins: number,
                losses: number,
            },
            warzoneProfile: {
                username: string,
                platform: typeof platforms,
            },
            valorantProfile: {
                username: string,
                tag: string,
            }
        },
    ],
    MCServerData: {
        serverList: [
            {
                name: string,
                ip: string,
                port: number
            },
        ],
        selectedServer: {
            name: string,
            ip: string,
            port: number
        },
    },
}