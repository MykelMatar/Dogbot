import DiscordJS, {
    ActivityType,
    APISelectMenuOption,
    ApplicationCommandData,
    AutocompleteInteraction,
    Collection,
    CommandInteraction,
    Message,
    Snowflake
} from "discord.js";
import {platforms} from "call-of-duty-api";
import {Document} from "mongoose";

export interface NewClient extends DiscordJS.Client {
    commands: DiscordJS.Collection<string, SlashCommand>
    isTestBot: boolean
    settings: {
        autoFetchIP: boolean
    }
}

interface CustomSlashCommandBuilder {
    name: string;
    description: string;
    toJSON?: () => ApplicationCommandData;
}

export interface SlashCommand {
    data: CustomSlashCommandBuilder;
    cooldown?: number;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    execute: (client: NewClient, interaction: CommandInteraction, guildData: IGuild) => Promise<void | Message>;
}

export interface Activity {
    activity: string
    type: ActivityType.Playing | ActivityType.Streaming | ActivityType.Listening | ActivityType.Watching | ActivityType.Competing
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

export interface FetchLeaderboardUser {
    name: string
    enlists: number
    rejects: number
    enlistPercentage: number
    rejectPercentage: number
    EnlistRankValue: number
    RejectRankValue: number
}

export interface predictionLeaderboardUser {
    name: string
    correctPredicions: number
    incorrectPredicions: number
    points: number
}

export interface FetchUserData {
    enlistedUsers: string[]
    enlistedUserIds: Snowflake[]
    rejectedUsers: string[]
    rejectedUserIds: Snowflake[]
    potentialUsers: string[]
    potentialUserIds: Snowflake[]
    ignoredUserIds: Snowflake[]
    userAvailabilityMap: Collection<Snowflake, string>
}

export interface PollStats {
    choice1: number
    choice2: number
    choice3: number
    choice4: number
    choice5: number
    total: number
}

export type PredictionStats = Partial<PollStats>;

export interface IGuild extends Document {
    guild: string;
    guildId: string;
    settings: {
        autoDetectIP: boolean
    },
    userData: {
        username: string;
        id: string;
        fetchStats?: {
            enlists: number;
            rejects: number;
            ignores: number;
            fetchXP: number;
            fetchStreak: number;
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
        predictionStats?: {
            points: number;
            correctPredictions: number;
            incorrectPredictions: number;
        }
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
    updatedAt: number
}

export enum UserInfo {
    Enlist = 'Enlist',
    Reject = 'Reject',
    Ignore = 'Ignore',
    Perhaps = 'Perhaps',
    WarzoneProfile = 'WarzoneProfile',
    ValorantProfile = 'ValorantProfile',
    PredictionCreate = 'PredictionCreate',
    CorrectPrediction = 'CorrectPrediction',
    IncorrectPrediction = 'IncorrectPrediction',
}

export const embedColor = '#B8CAD1'