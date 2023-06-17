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
            'yes',
            'no',
            'perhaps',
            'definitely not',
            'absolutely',
            'without a doubt',
            'with much doubt',
            'how would I know?',
            'shut up not now',
            'lol no'
        ]

        const response = responses[Math.floor(Math.random() * responses.length)]
        const responseEmbed = new EmbedBuilder()
            .setTitle(response)
            .setColor(embedColor)

        await interaction.reply({content: `Question: ${interaction.options.data[0].value}`, embeds: [responseEmbed]})
    }
}
