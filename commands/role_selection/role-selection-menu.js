const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const data = require('../../data.json');
const generateMenuOptions = require('../../helperFunctions/generateMenuOptions');
const writeToJson = require('../../helperFunctions/writeToJson');


module.exports = {
    name: 'role-selection-menu',
    description: 'creates dropdown menu to select user roles',
    async execute(client, interaction, guildName) {
        console.log(`role-selection-menu requested by ${interaction.member.user.username}`);
        // check for admin perms & prevent multiple instances from running
        if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }  // check for admin perms

        // retrieve role(s)
        let cmdOptions = interaction.options._hoistedOptions
        let listSize = cmdOptions.length
        console.log(cmdOptions[0].value); // cmdOptions[0].role.name = label
        // sort through optional inputs and set them accordingly

        var options = [];
        options = await generateMenuOptions(guildName, cmdOptions, listSize);
        let option = options[0];

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('selection')
                    .setPlaceholder('Nothing selected')
                    .setMaxValues(listSize)
                    .addOptions(option),
            );

        // send message so collector can stay up indefinitely
        await interaction.deleteReply()
        await interaction.channel.send({content: 'Select Your desired roles. Select the roles again to remove them.', components: [row] }); 

        // collect responses, stay up indefinitely
        // if id is from these selections, go through with execution, otherwise do nothing

        // Response collection and handling
        const collector = interaction.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU'});
        // await preventInteractionCollision(interaction, collector)
    
        collector.on('collect', async i => {
        
        
        });

        collector.on('end', async collected => {
            console.log(`role-selection-menu collected ${collected.size} menu selections`)
        });

    }
}
