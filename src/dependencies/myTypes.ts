import DiscordJS, {
    APISelectMenuOption,
    ApplicationCommandData,
    Collection,
    CommandInteraction,
    Message,
    Snowflake
} from "discord.js";
import {platforms} from "call-of-duty-api";
import {Document} from "mongoose";

export interface NewClient extends DiscordJS.Client {
    commands: DiscordJS.Collection<string, SlashCommand> // allows commands to be bound to the client instance for global retrieval
    isTestBot: boolean // whether it is the test bot or not
}

interface CustomSlashCommandBuilder {
    name: string;
    description: string;
    toJSON?: () => ApplicationCommandData; // or `ApplicationCommandData` if you need it
}

export interface SlashCommand {
    data: CustomSlashCommandBuilder;
    cooldown?: number;
    execute: (client: NewClient, interaction: CommandInteraction, guildData: IGuild) => Promise<void | Message>;
}

export interface ValorantProfile {
    username: string
    tag: string
}

export interface WarzoneProfile {
    username: string
    platform: platforms
}

export type GameProfile = ValorantProfile | WarzoneProfile

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
    enlistedUserIds: Snowflake[] // for pushing user data to mongoDB
    rejectedUsers: string[]
    rejectedUserIds: Snowflake[]
    potentialUsers: string[]
    potentialUserIds: Snowflake[]
    ignoredUserIds: Snowflake[]
    userAvailabilityMap: Collection<Snowflake, string>
}

export interface IGuild extends Document {
    guild: string;
    guildId: string;
    serverData: {
        welcomeChannel: string;
        roles: {
            autoenlist: string;
            default: string;
        };
    };
    userData: {
        username: string;
        id: string;
        enlistStats?: {
            enlists: number;
            rejects: number;
            ignores: number;
            enlistXp: number;
            enlistStreak: number;
        };
        tttStats?: {
            wins: number;
            losses: number;
        };
        warzoneProfile?: {
            username: string;
            platform: platforms;
        };
        valorantProfile?: {
            username: string;
            tag: string;
        };
    }[];
    mcServerData: {
        serverList: {
            name: string;
            ip: string;
            port: number;
        }[];
        selectedServer: {
            name: string;
            ip: string;
            port: number;
        };
    };
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