const { } = require('discord.js');
const fs = require('fs')


module.exports = {
    name: 'suggestion',
    description: 'allows users to make suggestions about dogbot',
    async execute(client, interaction) {
        console.log(`suggestion created by ${interaction.member.user.username} in ${interaction.member.guild.name}`);

        let suggestion = JSON.stringify((interaction.options._hoistedOptions[0]).value)

        fs.appendFile('Suggestions.txt', ` New Suggestion:\n${suggestion}\n\n`, err => {
            if (err) throw err
        });

        await interaction.editReply({content: 'Suggestion noted'})
    }
}