import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {CustomClient, SlashCommand} from "../../dependencies/myTypes";

export const invite: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('get dogbots invite link'),

    async execute(client: CustomClient, interaction: CommandInteraction) {
        await interaction.reply({content: '[invite Dogbot to your server!](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands)'})
    }
}