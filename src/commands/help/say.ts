
import {Command} from "../../dependencies/classes/Command";

export const say = new Command(
    'say',
    'sends a message via Dogbot',
    async (client, interaction) => {
        await interaction.reply({  ephemeral: true , content: 'message sent'});
        interaction.channel.send(`${interaction.options.data[0].value}`)
    }
)