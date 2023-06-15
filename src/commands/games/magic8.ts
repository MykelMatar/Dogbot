import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {embedColor, NewClient} from "../../dependencies/myTypes";

export const magic8 = {
    data: new SlashCommandBuilder()
        .setName('magic8')
        .setDescription('Predicts via a magic8 ball')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('prompt you want Dogbot to predict')
                .setRequired(true)),

    async execute(client: NewClient, interaction: CommandInteraction) {
        let responses: string[] = [
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

        let response = responses[Math.floor(Math.random() * responses.length)]
        let responseEmbed = new EmbedBuilder()
            .setTitle(response)
            .setColor(embedColor)

        await interaction.reply({content: `Question: ${interaction.options.data[0].value}`, embeds: [responseEmbed]})
    }
}
