import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {CustomClient, embedColor, SlashCommand} from "../../dependencies/myTypes";

export const magic8: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('magic8')
        .setDescription('Predicts via a magic8 ball')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('prompt you want Dogbot to predict')
                .setRequired(true)),

    async execute(client: CustomClient, interaction: CommandInteraction) {
        const responses: string[] = [
            // yes responses
            'yes',
            'absolutely',
            'without a doubt',

            // no responses
            'no',
            'lol no',
            'definitely not',

            // other responses
            'perhaps',
            'how would I know?',
        ]

        const response = responses[Math.floor(Math.random() * responses.length)]
        const responseEmbed = new EmbedBuilder()
            .setTitle(response)
            .setColor(embedColor)

        await interaction.reply({content: `Question: ${interaction.options.data[0].value}`, embeds: [responseEmbed]})
    }
}
