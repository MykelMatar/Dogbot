/**
 * collection and interaction handling for !mc
 * @param  {string} client
 * @param  {string} message
 * @param  {string} args
 * @param  {string} guildName
 */
function runMcButtonCollector(client, interaction, guildName) {
  const filter = i => i.user.id === interaction.member.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', max: 1, time: 10000 }); // only message author can interact, 1 response, 10s timer 

  const command1 = client.commands.get('mc-change-server');
  const command2 = client.commands.get('mc-list-servers');

  collector.on('collect', async i => {
    var update, execute;
    if (i.customId === 'Change') {
      update = i.update({ content: 'Server Change Requested', components: [] });
      execute = command1.execute(client, interaction, guildName);
    }
    else if (i.customId === 'List') {
      update = i.update({ content: 'Server List Requested', components: [] });
      execute = command2.execute(client, interaction, guildName);
    }
    Promise.all([update, execute])
  });

  collector.on('end', async collected => {
    console.log(`mc collected ${collected.size} button presses`)
    if (collected.size == 0) await interaction.editReply({ components: [] })  // remove buttons
  });

}

module.exports = runMcButtonCollector;