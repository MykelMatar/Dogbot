import {Command} from "../../dependencies/classes/Command";
import {MessageEmbed} from "discord.js";

export const magic8 = new Command(
    'magic8',
    'Predicts via a maigc 8-ball',
    async (client, interaction) => {

        let responses: string[] = ['yes', 'no', 'perhaps', 'definitely not', 'absolutely', 'how would I know?']
        let response = responses[Math.floor(Math.random() * responses.length)]
        let responseEmbed = new MessageEmbed()
            .setTitle(response)
            .setColor("#8570C1")

        await interaction.reply({content: `Question: ${interaction.options.data[0].value}`, embeds: [responseEmbed]})
    }
)