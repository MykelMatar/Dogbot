import DiscordJS, {
    ActivityType,
    APISelectMenuOption,
    AutocompleteInteraction,
    Collection,
    CommandInteraction,
    Message,
    SlashCommandBuilder,
    Snowflake
} from "discord.js";
import {Document} from "mongoose";

export interface CustomClient extends DiscordJS.Client {
    commands: DiscordJS.Collection<string, SlashCommand>
    isTestBot: boolean
}

export interface SlashCommand {
    data: Partial<SlashCommandBuilder>;
    cooldown?: number;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    execute: (client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) => Promise<void | Message>;
}

export interface Activity {
    activity: string
    type: ActivityType.Playing | ActivityType.Streaming | ActivityType.Listening | ActivityType.Watching | ActivityType.Competing
}

export interface ValorantProfile {
    username: string
    tag: string
}

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
    enlistRankValue: number
    rejectRankValue: number
}

export interface PredictionLeaderboardUser {
    name: string
    correctPredictions: number
    incorrectPredictions: number
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

export interface MongoGuild extends Document {
    guild: string;
    guildId: string;
    settings: {
        autoDetectIP: boolean,
        fetchRole: string | Snowflake
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
    ValorantProfile = 'ValorantProfile',
    PredictionCreate = 'PredictionCreate',
    CorrectPrediction = 'CorrectPrediction',
    IncorrectPrediction = 'IncorrectPrediction',
}

export const embedColor = '#B8CAD1'