import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {CustomClient, MongoGuild, SlashCommand} from "../../dependencies/myTypes";

export const checkTimezone: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('check-timezone')
        .setDescription('checks registered timezone'),

    async execute(client: CustomClient, interaction: CommandInteraction, guildData: MongoGuild) {
        const timezone = guildData.settings.timeZone
        await interaction.reply({content: `Timezone is set to ${timezone.name} -- ${timezone.offset}`})
    }
}