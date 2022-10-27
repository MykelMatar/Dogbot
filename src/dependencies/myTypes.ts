import DiscordJS from "discord.js";

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