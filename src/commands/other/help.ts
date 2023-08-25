import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import {CustomClient, embedColor, SlashCommand} from "../../dependencies/myTypes";

export const help: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('lists all commands and relevant information')
        .addBooleanOption(option =>
            option.setName('hide')
                .setDescription('Whether to hide response or not')
                .setRequired(false)),

    async execute(client: CustomClient, interaction: CommandInteraction) {

        const inviteLink = '[Invite Me](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands)'
        const supportLink = '[Support Server](https://discord.gg/bmeCXkQAaj)'
        const voteLink = '[Vote for me!](https://top.gg/bot/848283770041532425)'

        const home = new EmbedBuilder()
            .setTitle('Dogbot Help')
            .setDescription(`Use the Buttons to navigate between pages, or visit the [wiki](https://github.com/MykelMatar/Dogbot/wiki) for a more comprehensive help guide`)

            .addFields(
                {
                    name: 'Support',
                    value: `${inviteLink} • ${supportLink} •  ${voteLink}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                },
                {
                    name: 'Dogbot\'s favorite tricks',
                    value: '`🎮 /fetch-gamers`\n `🔮 /prediction`\n `🗳️ /poll`\n `🟩 /mc-status`\n `🎱 /magic8`\n `📝 /patch-notes`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ',
                },
            )
            .setFooter({text: '🗏 Page 0/5 -- maintained by .dogbert'})
            .setColor(embedColor)

        // paginated help command again? or at least describe the basic ones
        // also add invite link and vote button and support server

        const fetch = new EmbedBuilder()
            .setTitle('🎮 fetch commands 🎮')
            .setDescription(
                '**Friendship saver**'
            )
            .addFields(
                {
                    name: 'commands',
                    value:
                        '`/fetch-gamers       : creates interaction to recruit gamers for gamer time' +
                        '\r/fetch-stats        : shows user stats relevant to the fetch-gamers' +
                        '\r/fetch-leaderboard  : shows leaderboard of top gamers' +
                        '\r/fetch-role         : used to check, clear, or change the role mentioned`'
                    ,
                },
            )
            .setColor(embedColor)
            .setFooter({text: '🗏 Page 1/5 -- maintained by .dogbert'})

        const mc = new EmbedBuilder()
            .setTitle('🟩 minecraft commands 🟩')
            .setDescription(
                '**Hey bro is the server up? x10**'
            )
            .addFields(
                {
                    name: 'commands',
                    value:
                        '`/mc-status         : gets status of selected server or one that you input' +
                        '\r/mc-server         : changes the server being tracked by mc-status' +
                        '\r/mc-list-servers   : lists all servers and their respective IPs' +
                        '\r/mc-add-server     : adds server to Dogbot\'s tracked server list' +
                        '\r/mc-change-ip      : changes an existing server\'s IP address' +
                        '\r/mc-change-name    : changes an existing server\'s name' +
                        '\r/mc-delete-server  : deletes server from Dogbot\'s tracked server list`',
                },
            )
            .setColor(embedColor)
            .setFooter({text: '🗏 Page 2/5 -- maintained by .dogbert'})

        const prediction = new EmbedBuilder()
            .setTitle('🔮 prediction commands 🔮')
            .setDescription(
                '**Gamblers Unite**'
            )
            .addFields(
                {
                    name: 'function',
                    value:
                        '`/prediction             : creates a prediction to bet on' +
                        '\r/prediction-stats       : Shows total points and win stats' +
                        '\r/prediction-leaderboard : Displays top 10 users with the most points`',
                },
            )
            .setColor(embedColor)
            .setFooter({text: '🗏 Page 3/5 -- maintained by .dogbert'})

        const other = new EmbedBuilder()
            .setTitle('🐕 other commands 🐕')
            .setDescription(
                '**Complements of the chef**'
            )
            .addFields(
                {
                    name: 'function',
                    value:
                        '`/magic8        :Dogbot Makes a prediction via a magic 8 ball (also happens to be the ball he plays fetch with)' +
                        '\r/patch-notes  : shows Dogbot\'s most recent changes (coat trims, new tricks, buried treasure)' +
                        '\r/server-stats : displays some stats about the server you are in`',
                },
            )
            .setColor(embedColor)
            .setFooter({text: '🗏 Page 4/5 -- maintained by .dogbert'})

        const settings = new EmbedBuilder()
            .setTitle('⚙️ server settings ⚙️')
            .setDescription(
                '**Customize your experience**'
            )
            .addFields(
                {
                    name: 'function',
                    value:
                        '`/auto-detect-mc-ip : automatically scans your chat for IPs and Dogbot will ask if you want to add it if he sees one. Default is on' +
                        '\r/set-timezone      : sets the timezone used when calculating the fetch-gamers timer. No default, must be set' +
                        '\r/get-timezone      : displays timezone used when calculating the fetch-gamers timer`',
                },
            )
            .setColor(embedColor)
            .setFooter({text: '🗏 Page 5/5 -- maintained by .dogbert'})

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`← `)
                    .setCustomId('prevPage')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`→`)
                    .setCustomId('nextPage')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel(`Wiki`)
                    .setURL('https://github.com/MykelMatar/Dogbot/wiki')
                    .setStyle(ButtonStyle.Link),
            );

        const pages = {
            0: home,
            1: fetch,
            2: mc,
            3: prediction,
            4: other,
            5: settings
        }
        let pageNumber = 0
        console.log(Object.keys(pages).length)
        let sent = await interaction[interaction.deferred ? 'editReply' : 'reply']({
            embeds: [pages[0]],
            components: [row]
        });

        // create collector
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => {
                if (i.message.id != sent.id) return false
                return ['nextPage', 'prevPage', 'wiki'].includes(i.customId);
            },
            time: 900_000,
            componentType: ComponentType.Button
        });

        // collect response
        collector.on('collect', async i => {
            const isNotFirstPage = pageNumber > 0
            const isNotLastPage = pageNumber < Object.keys(pages).length - 1

            if (i.customId === 'nextPage' && isNotLastPage) {
                // await i.deferUpdate()
                pageNumber++
                await i.update({embeds: [pages[pageNumber]], components: [row]});
            }
            if (i.customId === 'prevPage' && isNotFirstPage) {
                // await i.deferUpdate()
                pageNumber--
                await i.update({embeds: [pages[pageNumber]], components: [row]});
            }
        });

        collector.on('end', async () => {
            await sent.edit({components: []});
        })

        // await interaction.editReply({embeds: [embed], files: [file]})
    }
}
