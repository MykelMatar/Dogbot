const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const generateMenuOptions = require('../../helperFunctions/general_helpers/generateMenuOptions');

// TODO: create embed with roles and descriptions; consider creating /addrole {role} {description} and /removerole commands
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
                    .setMinValues(0)
                    .setMaxValues(listSize)
                    .addOptions(option),
            );

        // send message so collector can stay up indefinitely
        await interaction.deleteReply()
        await interaction.channel.send({ content: 'Select Your desired roles. Select the roles again to remove them.', components: [row] });

        // Response collection and handling
        const collector = await interaction.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU' });

        collector.on('collect', async i => {
            const { customId, values, member } = i
            if (customId === 'role-select') {
                await i.deferUpdate()
                if (interaction.member.manageable) {    // verify that the member's roles can be changed
                    const removed = cmdOptions.filter((option) => { // retrieve deselected roles 
                        return !values.includes(option.value)
                    })
                    for (const id of values) { // add selected roles
                        await member.roles.add(id)
                            .catch(error => { // just in case Discord API error arises
                                console.log(error)
                                interaction.channel.send('could not give role. Make sure the "Dogbot" role is high up in the role hierarchy ')
                            });
                    }
                    for (const id of removed) { // remove deselected roles
                        await member.roles.remove(id.value)
                            .catch(error => {
                                console.log(error)
                                interaction.channel.send('could not give role. Make sure the "Dogbot" role is high up in the role hierarchy ')
                            });
                    }
                } else
                    interaction.channel.send('could not remove role. Make sure the "Dogbot" role is high up in the role hierarchy ')
            }
        });

        collector.on('end', async collected => {
            console.log(`role-selection-menu collected ${collected.size} menu selections`)
        });
    }
}
