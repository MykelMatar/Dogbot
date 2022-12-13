import DiscordJS, {APISelectMenuOption, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {platforms} from "call-of-duty-api";

export const embedColor = '#B8CAD1'

export type NewClient = DiscordJS.Client & {
    commands: DiscordJS.Collection<string, SlashCommand> // allows commands to be bound to the client instance for global retrieval
}

export type SlashCommand = {
    data: SlashCommandBuilder
    cooldown: number
    execute(client: NewClient, interaction: CommandInteraction, guildData, guildName: string): Promise<void>
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

export interface EnlistLeaderboardUser {
    name: string
    enlists: number
    rejects: number
    enlistPercentage: number
    rejectPercentage: number
    adjustedEnlistRankValue: number
    adjustedRejectRankValue: number
}

export interface Leaderboard {
    names: string[]
    statPercentages: string[]
    statTotals: string[]
}

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

export interface GuildSchema {
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