import {ChannelType, CommandInteraction, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import {getVoiceConnection} from '@discordjs/voice';

const leaveVc = {
    data: new SlashCommandBuilder()
        .setName('leave-vc')
        .setDescription('disconnects dogbot from voice channel '),

    async execute(client: NewClient, interaction: CommandInteraction) {
        const connection = getVoiceConnection(interaction.guild.id)
        connection.destroy()
        await interaction.reply({content: 'Disconnecting...', ephemeral: true})
    }
}
