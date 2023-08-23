import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {CustomClient, embedColor, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

export const patchNotes: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('patch-notes')
        .setDescription('gets most recent Dogbot patch notes'),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const dogbotInfo = require('../../../package.json')

        const embed = new EmbedBuilder()
            .setTitle(`Dogbot Patch Notes (v${dogbotInfo.version})`)
            .setDescription(`August 20, 2023`)
            .addFields(
                {
                    name: 'fetch-gamers',
                    value: `• now supports timezones 
                            • if time option is used, it will prompt you for your timezone by default. this will only occur once.
                            • supports 'hh:mm am/pm' and 24 hour formats
                            • fetch-gamers will now end when the specified time arrives (or will still default to 3 hours if no time is specified)
                            • the Summon Gamers button was removed and now automatically mentions necessary people when it's gamer time`
                },
                {
                    name: 'new commands',
                    value: `• **set-timezone**: sets timezone used in fetch-gamer timer calculations (aka when the prompt ends and when the gamers are @\'d)
                            • **patch-notes**: Does this! shows you the most recent updates to Dogbot. `
                },
                {
                    name: 'misc',
                    value: `• renamed all instances of 'enlist' to 'accept'
                            • deleting interactions like 'fetch-gamers' or 'prediction' no longer crashes Dogbot`
                },
            )
            .setColor(embedColor)

        await interaction.reply({embeds: [embed]})
    }
}