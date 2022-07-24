import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {newClient} from "../../dependencies/myTypes";
import guilds from "../../dependencies/schemas/guild-schema";

export const checkroleAutoenlist = {
    data: new SlashCommandBuilder() 
        .setName('checkrole-autoenlist')
        .setDescription('Returns the role currently being used to auto enlist')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to display the response or not')
                .setRequired(false)),
        
    async execute(client: newClient, interaction: CommandInteraction){
        const currentGuild = await guilds.findOne({guildId: interaction.guildId})
        if (!currentGuild) return
        let selectedRole = currentGuild.ServerData.roles.autoenlist
        
        let role = interaction.guild.roles.cache.find(r => r.id === selectedRole)
        
        let ephemeralSetting
        let hideOption = interaction.options.data
        if (hideOption.length == 0) ephemeralSetting = true
        else ephemeralSetting = interaction.options.data[0].value
        
        await interaction.reply({content: `${role}`, ephemeral: ephemeralSetting})
    }
}