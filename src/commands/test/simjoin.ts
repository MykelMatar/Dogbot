import {SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const simJoin = {
    data: new SlashCommandBuilder()
        .setName('simjoin')
        .setDescription('simulates user joining'),

    async execute(client: newClient, message) {
        client.emit('guildMemberAdd', message.member)
    }
}