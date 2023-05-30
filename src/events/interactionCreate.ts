import {AutocompleteInteraction, CommandInteraction, GuildMember} from "discord.js";
import {IGuild, NewClient, SlashCommand} from "../dependencies/myTypes";
import guilds from "../dependencies/schemas/guild-schema";
import log from "../dependencies/logger";

// const cooldowns = new Map()

export async function interactionCreate(client: NewClient, interaction: CommandInteraction | AutocompleteInteraction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return

    interaction = interaction as CommandInteraction | AutocompleteInteraction; // idk why i need this but i do
    const command: SlashCommand = client.commands.get(interaction.commandName)
    if (!command) return;

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
        let hideCommands: string[] = ['mc', 'get-stats', 'server-stats', 'help']
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
            let guildData: IGuild = await guilds.findOne({guildId: interaction.guildId})
            await command.execute(client, interaction, guildData);
        } catch (error) {
            log.error(error)
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    } else if (interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            log.error(error)
        }
    }


}