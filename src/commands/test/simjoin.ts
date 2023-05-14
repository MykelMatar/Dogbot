import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";

export const simJoin = {
    data: new SlashCommandBuilder()
        .setName('simjoin')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('simulates user joining'),

    async execute(client: NewClient, message) {
        client.emit('guildMemberAdd', message.member)
    }
}