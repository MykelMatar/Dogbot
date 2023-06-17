import log from "../../dependencies/constants/logger";
import {CustomClient} from "../../dependencies/myTypes";
import {VoiceState} from "discord.js";
import {getVoiceConnection, joinVoiceChannel} from "@discordjs/voice";

async function voiceStateUpdate(client: CustomClient, oldState: VoiceState, newState: VoiceState) {
    // Check if the bot is joining a voice channel
    if (!oldState.channelId && newState.channelId) {
        // Check if bot is already in a voice channel
        const connection = getVoiceConnection(newState.guild.id);
        if (connection) return;
        // Check if the user joining the voice channel is the first user
        if (newState.channel.members.size >= 1) {
            // Join the same voice channel as the first user
            joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                selfDeaf: false,
                // @ts-ignore (possible issue with library. Thinks these 2 are incompatible)
                adapterCreator: newState.guild.voiceAdapterCreator,
            });
        }
    }

    // Check if the bot is leaving a voice channel
    if (oldState.channelId && !newState.channelId || oldState.channelId && newState.channelId) {
        // Check if the bot is the only user left in the voice channel
        if (oldState.channel.members.size === 1) {
            // Leave the voice channel
            const connection = getVoiceConnection(oldState.guild.id);
            connection.destroy()
        }
    }

    log.info(`${oldState.channelId} && ${newState.channelId}`);
}