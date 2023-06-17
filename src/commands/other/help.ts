import {AttachmentBuilder, CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {CustomClient, embedColor, SlashCommand} from "../../dependencies/myTypes";

export const help: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('lists all commands and relevant information')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction) {

        const file = new AttachmentBuilder('./src/dependencies/images/Dogbot_Logo_512.png')

        const embed = new EmbedBuilder()
            .setTitle('Dogbot Wiki')
            .setDescription('Please visit the [wiki](https://github.com/MykelMatar/Dogbot/wiki) for a comprehensive list of every command')
            .setImage('attachment://Dogbot_Logo_512.png')
            .setURL('https://github.com/MykelMatar/Dogbot/wiki')
            .setFooter({text: 'This bot is created and maintained by .dogbert'})
            .setColor(embedColor)

        await interaction.editReply({embeds: [embed], files: [file]})
    }
}
