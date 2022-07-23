import {CommandInteraction, GuildMember} from "discord.js";
import {newClient} from "../../dependencies/myTypes";
import guilds from "../../dependencies/schemas/guild-schema";
import {log} from "../../dependencies/logger";

export async function interactionCreate(client: newClient, interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return;
    
    let guildName = interaction.guild.name.replace(/\s+/g, "")
    let hideCommands: string[] = ['mc', 'get-stats', 'server-stats']
    let ephemeralSetting

    let hideOption = interaction.options.data.find(option => option.name === 'hide')
    if (hideOption === undefined) ephemeralSetting = true
    else ephemeralSetting = hideOption.value
    
    if (hideCommands.some(com => command.data.name.startsWith(com))) {
        await interaction.deferReply({ephemeral: ephemeralSetting})
    }
    if (command.name === 'enlist-users' && interaction.options.data.length !== 0) {
        await interaction.reply({content: `${interaction.options.data[0].value}`})
    }

    try {
        if (!(!(interaction.member instanceof GuildMember) )) {
            log.info(`${interaction.commandName} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }
        let guildData = await guilds.findOne({guildId: interaction.guildId})
        await command.execute(client, interaction, guildData, guildName);
    } catch (error) {
        log.error(error)
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
}