import {ChannelType, CommandInteraction, CommandInteractionOption, SlashCommandBuilder} from "discord.js";
import {NewClient} from "../../dependencies/myTypes";
import {joinVoiceChannel} from '@discordjs/voice';

export const joinVc = {
    data: new SlashCommandBuilder()
        .setName('join-vc')
        .setDescription('sends dogbot to voice channel user is in (or selected voice channel)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('voice channel you want Dogbot to join')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false)),

    async execute(client: NewClient, interaction: CommandInteraction) {
        let voiceChannel: string
        let voiceChannelOption: CommandInteractionOption = interaction.options.data.find(option => option.name === 'channel')
        if (voiceChannelOption !== undefined) {
            voiceChannel = voiceChannelOption.value as string
            // @ts-ignore, compiler thinks .voice does not exist on 'member'
        } else if (interaction.member.voice.channel != null) {
            // @ts-ignore
            voiceChannel = interaction.member.voice.channel.id
        } else {
            return interaction.reply({
                content: 'Please join a channel or specify one in the join-vc commands',
                ephemeral: true
            })
        }

        joinVoiceChannel({
            channelId: voiceChannel,
            guildId: interaction.channel.guild.id,
            // @ts-ignore (possible issue with library. Thinks these 2 are incompatible)
            adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });
        await interaction.reply({content: 'Joining Voice Channel', ephemeral: true})
    }
}
