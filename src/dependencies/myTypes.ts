import DiscordJS, {APISelectMenuOption} from "discord.js";
import {platforms} from "call-of-duty-api";

export type newClient = DiscordJS.Client & {
    commands: DiscordJS.Collection<string,any> // allows commands to be bound to the client instance for global retrieval
}

export type MenuGeneratorReturnValues = {
    optionsArray: APISelectMenuOption[],
    options: DiscordMenuOption,
}

export interface DiscordMenuOption {
    label: string[]
    description: string[]
    value: string[]
}

// Interface to hold stats for users displayed on the enlist-leaderboard
export interface LeaderboardUser {
    name: string
    enlists: number
    rejects: number
    enlistPercentage: number
    rejectPercentage: number
    adjustedEnlistRankValue: number
    adjustedRejectRankValue: number
}

// Interface to hold user information for updating user stats in enlist-users
export interface EnlistUserInfoArrays {
    enlistedUsers: string[]
    enlistedUserIds: string[] // for pushing user data to mongoDB
    rejectedUsers: string[]
    rejectedUserIds: string[]
    potentialUsers: string[]
    potentialUserIds: string[]
    ignoredUserIds: string[]
}

export interface MinecraftServer {
    name: string
    ip: string
    port: number
}

export interface Guild { // mongoose schema interface
    guild: string
    guildId: string
    ServerData: {
        welcomeChannel: string
        roles: {
            autoenlist: string
            default: string
        }
    }
    UserData: [
        {
            username: string
            id: string
            enlistStats: {
                enlists: number
                rejects: number
                ignores: number
            }
            tttStats: {
                wins: number
                losses: number
            }
            warzoneProfile: {
                username: string
                platform: typeof platforms
            }
            valorantProfile: {
                username: string
                tag: string
            }
        }
    ]
    MCServerData: {
        serverList: [
            {
                name: string
                ip: string
                port: number
            }
        ]
        selectedServer: {
            name: string
            ip: string
            port: number
        }
    }
}