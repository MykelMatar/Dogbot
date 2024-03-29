import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {CustomClient} from "../../dependencies/myTypes";

export const simLeave = {
    data: new SlashCommandBuilder()
        .setName('simleave')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('simulates user leaving'),

    async execute(client: CustomClient, message) {
        client.emit('guildMemberRemove', message.member)
    }
}