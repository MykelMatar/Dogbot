import {AutocompleteInteraction, CommandInteraction, GuildMember} from "discord.js";
import {CustomClient, MongoGuild, SlashCommand} from "../dependencies/myTypes";
import guilds from "../dependencies/schemas/guild-schema";
import log from "../dependencies/constants/logger";

// const cooldowns = new Map()
const runningCommands = new Map()
const singleInstanceCommands = new Set(['prediction'])

export async function interactionCreate(client: CustomClient, interaction: CommandInteraction | AutocompleteInteraction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return

    // interaction = interaction as CommandInteraction | AutocompleteInteraction; // idk why i need this but i do
    const command: SlashCommand = client.commands.get(interaction.commandName)
    if (!command) return;

    let commandInstances: Set<string>
    if (singleInstanceCommands.has(command.data.name)) {
        if (!runningCommands.has(command.data.name)) {
            runningCommands.set(command.data.name, new Set())
        }
        commandInstances = runningCommands.get(command.data.name)
        let guildHasCommandRunning = undefined
        if (commandInstances.has(interaction.guild.id)) {
            guildHasCommandRunning = commandInstances.has(interaction.guild.id)
        }

        if (guildHasCommandRunning && interaction.isChatInputCommand()) {
            return interaction.reply({
                ephemeral: true,
                content: `Command already running`
            })
        }

        commandInstances.add(interaction.guild.id)
    }
    // cooldown logic for commands
    // if (!cooldowns.has(command.data.name)) {
    //     cooldowns.set(command.data.name, new Collection())
    // }
    //
    // const currentTime = Date.now();
    // const timeStamps = cooldowns.get(command.data.name)
    // const cooldown_time = (command.cooldown) * 1000 // convert to ms
    //
    // if (timeStamps.has(interaction.guild.id)) {
    //     const expirationTime = timeStamps.get(interaction.guild.id) + cooldown_time
    //
    //     if (currentTime < expirationTime) {
    //         const timeLeft = (expirationTime - currentTime) / 1000
    //         return interaction.reply({
    //             ephemeral: true,
    //             content: `please wait ${timeLeft.toFixed(1)} more seconds before using ${command.data.name}`
    //         })
    //     }
    // }
    // timeStamps.set(interaction.guild.id, currentTime)


    // execute command
    if (interaction.isChatInputCommand()) {
        // global ephemeral interaction handling (for commands w/ optional 'hide' param)
        const hideCommands: string[] = ['mc', 'server-stats', 'help']
        let ephemeralSetting

        let hideOption = interaction.options.data.find(option => option.name === 'hide')
        if (hideOption === undefined) {
            ephemeralSetting = false
        } else {
            ephemeralSetting = hideOption.value
        }
        if (hideCommands.some(com => (command.data.name).startsWith(com))) {
            await interaction.deferReply({ephemeral: ephemeralSetting})
        }

        try {
            if ((interaction.member instanceof GuildMember)) {
                log.info(`${interaction.commandName} requested by ${interaction.member.user.username} in ${interaction.member.guild.name}`)
            }
            const guildData: MongoGuild = await guilds.findOne({guildId: interaction.guildId})
            await command.execute(client, interaction, guildData, commandInstances);
        } catch (error) {
            log.error(error)
            await interaction[interaction.replied ? 'editReply' : 'reply']({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    } else if (interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            log.error(error.message)
        }
    }


}