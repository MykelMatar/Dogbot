import DiscordJS, {APISelectMenuOption, Collection, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {platforms} from "call-of-duty-api";
import {Document} from "mongoose";

export type NewClient = DiscordJS.Client & {
    commands: DiscordJS.Collection<string, SlashCommand> // allows commands to be bound to the client instance for global retrieval
    isTestBot: boolean // whether it is the test bot or not
}

export type SlashCommand = {
    data: SlashCommandBuilder
    cooldown?: number
    execute(client: NewClient, interaction: CommandInteraction, guildData: GuildSchema, guildName: string): Promise<void>
}

export type GameProfile = ValorantProfile | WarzoneProfile

export interface ValorantProfile {
    username: string
    tag: string
}

export interface WarzoneProfile {
    username: string
    platform: platforms
}

export interface MinecraftServer {
    name: string
    ip: string
    port: number
}

export interface EnlistLeaderboardUser {
    name: string
    enlists: number
    rejects: number
    enlistPercentage: number
    rejectPercentage: number
    EnlistRankValue: number
    RejectRankValue: number
}

export interface EnlistUserData {
    enlistedUsers: string[]
    enlistedUserIds: string[] // for pushing user data to mongoDB
    rejectedUsers: string[]
    rejectedUserIds: string[]
    potentialUsers: string[]
    potentialUserIds: string[]
    ignoredUserIds: string[]
    userAvailabilityMap: Collection<string, string>
}

export type GuildSchema = Document & {
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
                platform: platforms
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

export enum UserStats {
    tttWins = 'tttWins',
    tttLosses = 'tttLosses',
    enlist = 'enlist',
    reject = 'reject',
    ignore = 'ignore',
    wzProfile = 'wzProfile',
    valProfile = 'valProfile',
}

export const embedColor = '#B8CAD1'