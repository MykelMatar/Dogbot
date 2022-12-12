import {Collection, CommandInteraction, GuildMember} from "discord.js";
import {NewClient, SlashCommand} from "../dependencies/myTypes";
import guilds from "../dependencies/schemas/guild-schema";
import log from "../dependencies/logger";

const cooldowns = new Map()

export async function interactionCreate(client: NewClient, interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return

    const command: SlashCommand = client.commands.get(interaction.commandName)
    if (!command) return;

    // cooldown logic for commands
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection())
    }

    const currentTime = Date.now();
    const timeStamps = cooldowns.get(command.data.name)
    const cooldown_time = (command.cooldown) * 1000 // convert to ms
    if (timeStamps.has(interaction.guild.id)) {
        const expirationTime = timeStamps.get(interaction.guild.id) + cooldown_time

        if (currentTime < expirationTime) {
            const timeLeft = (expirationTime - currentTime) / 1000
            return interaction.reply({
                ephemeral: true,
                content: `please wait ${timeLeft.toFixed(1)} more seconds before using ${command.data.name}`
            })
        }
    }
    timeStamps.set(interaction.guild.id, currentTime)

    // global ephemeral interaction handling (for commands w/ optional 'hide' param)
    let guildName = interaction.guild.name.replace(/\s+/g, "")
    let hideCommands: string[] = ['mc', 'get-stats', 'server-stats', 'help']
    let ephemeralSetting

    // universal ephemeral option for commands
    let hideOption = interaction.options.data.find(option => option.name === 'hide')
    if (hideOption === undefined) ephemeralSetting = true
    else ephemeralSetting = hideOption.value
    if (hideCommands.some(com => (command.data.name).startsWith(com))) {
        await interaction.deferReply({ephemeral: ephemeralSetting})
    }

    // execute command
    try {
        if (!(!(interaction.member instanceof GuildMember))) {
            log.info(`${interaction.commandName} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
        }
        let guildData = await guilds.findOne({guildId: interaction.guildId})
        await command.execute(client, interaction, guildData, guildName);
    } catch (error) {
        log.error(error)
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
}