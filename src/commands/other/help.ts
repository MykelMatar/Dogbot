import {
    EmbedBuilder,
    CommandInteraction,
    SlashCommandBuilder, AttachmentBuilder
} from "discord.js";
import {newClient} from "../../dependencies/myTypes";

export const help = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('lists all commands and relevant information')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: newClient, interaction: CommandInteraction) {

        const file = new AttachmentBuilder('./src/dependencies/images/Dogbot_Logo_512.png')
        
        const embed = new EmbedBuilder()
            .setTitle('Dogbot Wiki')
            .setDescription('Please visit the [wiki](https://github.com/MykelMatar/Dogbot/wiki) for a comprehensive list of every command')
            .setImage('attachment://Dogbot_Logo_512.png')
            .setURL('https://github.com/MykelMatar/Dogbot/wiki')
            .setFooter({text: 'This bot is created and maintained by Dogbert'})
            .setColor('#B8CAD1')
        
        await interaction.editReply({embeds: [embed], files: [file]})
    }
}