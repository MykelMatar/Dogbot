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
            // affirmative responses
            'Yes',
            'Absolutely',
            'Without a doubt',
            'Most Likely',
            'Signs point to yes. It\'s me im signs.',
            'It is certain',
            'You may rely on it',

            // negative responses
            'No',
            'lol no',
            'Definitely not',
            'Don\'t count on it',
            'My source says no.\nSource: trust me bro',
            'Very doubtful',

            // other responses
            'Perhaps',
            'How would I know?',
            'Concentrate and ask again. Or just don\'t ask again bc that question sucked.',
        ]

        const response = responses[Math.floor(Math.random() * responses.length)]
        const responseEmbed = new EmbedBuilder()
            .setTitle(response)
            .setColor(embedColor)

        await interaction.reply({content: `Question: ${interaction.options.data[0].value}`, embeds: [responseEmbed]})
    }
}
