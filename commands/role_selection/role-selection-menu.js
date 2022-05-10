const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const generateMenuOptions = require('../../helperFunctions/generateMenuOptions');

module.exports = {
    name: 'role-selection-menu',
    description: 'creates dropdown menu to select user roles',
    async execute(client, interaction, guildName) {
        console.log(`role-selection-menu requested by ${interaction.member.user.username}`);
        
        // check for admin perms & prevent multiple instances from running
        //if (!interaction.member.permissions.has("ADMINISTRATOR")) { return interaction.editReply('Only Admins can use this command') }  // check for admin perms

        // retrieve role(s)
        let cmdOptions = interaction.options._hoistedOptions
        let listSize = cmdOptions.length
        // sort through optional inputs and set them accordingly

        var options = [];
        options = await generateMenuOptions(guildName, cmdOptions, listSize);
        let option = options[0];

        // generate select menu
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('role-select')
                    .setPlaceholder('Nothing selected')
                    .setMaxValues(listSize)
                    .addOptions(option),
            );

        // send message so collector can stay up indefinitely
        await interaction.deleteReply()
        await interaction.channel.send({ content: 'Select Your desired roles. Select the roles again to remove them.', components: [row] });

        // collect responses, stay up indefinitely
        // if id is from these selections, go through with execution, otherwise do nothing

        // Response collection and handling
        const collector = await interaction.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU' });

        collector.on('collect', async i => {
            for (j = 0; j < i.values.length; j++) {
                if (!(i.member.roles.cache.has(i.values[j]))){
                    await i.member.roles.add(`${i.values[j]}`)
                        .catch(error => {
                            console.log(error)
                            interaction.channel.send('could not give role. Make sure the "Dogbot" role is high up in the role hierarchy ')
                        });
                }
                else {
                    await i.member.roles.remove(`${i.values[j]}`)
                        .catch(error => {
                            console.log(error)
                            interaction.channel.send('could not remove role. Make sure the "Dogbot" role is high up in the role hierarchy ')
                        });
                }
            }
        });

        collector.on('end', async collected => {
            console.log(`role-selection-menu collected ${collected.size} menu selections`)
        });

    }
}
