const { MessageEmbed } = require('discord.js');
const { clearInterval } = require('timers');
const Str = require('@supercharge/strings')
const data = require('../data.json');
const Timer = require('dayjs')
const fs = require('fs');
const { isString } = require('@supercharge/strings');



module.exports = {
    name: 'gt',
    description: "Schedules Gamer Time and sends reactions for collection",
    async execute(client, message, args, guildName) {
        let GTembedID = data.Guilds[guildName].Embeds.GTEmbedData["id"];

        //Argument Handling
        if (!args[0] || !args[1] || !args[2]) return message.reply("Missing Argument. Command Format: !gt {game} {time in 'hours:minutes' format} {am / pm}}")
        else if (!isString(args[0])) return message.reply("Game must be a string.")
        else {
            let game = args[0];
            var hours = args[1];
            var ampm = args[2];


            // !gt Embed creation
            const Embed = new MessageEmbed()
                .setTitle("Gamer Time")
                .setDescription("Please react to RSVP for Gamer Time, or if you would like to change any details, use !cummands for more commands")
                .addFields(
                    { name: "Game:", value: game },
                    { name: "Time", value: args[1] + ' ' + ampm },
                    { name: printEmoji1(message, guildName) + " Forsureforsure", value: '-', inline: true },
                    { name: printEmoji2(message, guildName) + " mayhaps", value: '-', inline: true },
                    { name: printEmoji3(message, guildName) + " no", value: '-', inline: true }
                )
                .setColor("#19e2e4")
                //.setThumbnail('https://i.ytimg.com/vi/ZLZTZSN0AnE/maxresdefault.jpg')
                .setImage('https://i.ytimg.com/vi/ZLZTZSN0AnE/maxresdefault.jpg')
                .setFooter('Created by Dogbert & Ziploc')

            //var modCheckID = message.guild.emojis.resolve('852735711789842443'); //remove this line and the line below if used in another server
            //var modCheck = modCheckID.toString()
            //message.channel.send(`<@&${'69321489329317482'}> `); //@gamers :modcheck:
            message.channel.send({ embeds: [Embed] });

            //edit variables for use in function
            var hours = Str(args[1]).before(':').get();
            hours = parseInt(hours);
            var minutes = Str(args[1]).after(':').get();
            minutes = parseInt(minutes);

            //timer for collector
            //let timer = getTimer(message, guildName, hours, minutes, ampm);
            //setTimeout(() => message.channel.send({content:"gamer time")}, timer);

            //Pushing Embed data to json file
            data.Guilds[guildName].Embed.GTEmbedData.Title = Embed.title;
            data.Guilds[guildName].Embed.GTEmbedData.Fields["Game"] = Embed.fields[0].value; //field[0] = game
            data.Guilds[guildName].Embed.GTEmbedData.Fields["Time"] = Embed.fields[1].value; //field[1] = time
           // data.Guilds[guildName].EmbedData.Fields["Timer"] = timer; // timer
            writeToJson(data);
        }
    }
}



//Collector + Helper Functions




// function getTimer(message, guildName, getHours, getMinutes, getAmpm) {

//     //retrieve current time and declare hour Left variable for us in if statement
//     hours = getHours;
//     minutes = getMinutes;
//     ampm = getAmpm;
//     var hoursLeft;
//     currentHour = dateToPDT(Timer);
//     currentMinutes = Timer.getMinutes();
//     if (hours == '12') {
//         hours = '00';
//         hoursLeft = hours - currentHour
//     }
//     if (ampm == "pm") {
//         hours += 12;
//         hoursLeft = hours - currentHour;
//     }
//     let minutesLeft = minutes - currentMinutes;
//     let timeLeft = ((hoursLeft * 60) + minutesLeft); //converts to minutes
//     var timer = timeLeft * 60000 //convert to ms for use as timer
//     console.log(timeLeft);
//     console.log(timer);
//     return timer;
// }


//getEmoji functions
function getEmoji1(message, guildName) {
    let emoji1Id = data.Guilds[guildName].EmojiData["0"];
    var emoji1;
    if (Number.isInteger(parseInt(emoji1Id))) {
        let resolveEmoji1 = message.guild.emojis.resolve(emoji1Id);
        emoji1 = resolveEmoji1
    } else { emoji1 = emoji1Id }

    return emoji1;
}

function getEmoji2(message, guildName) {
    let emoji2Id = data.Guilds[guildName].EmojiData["1"];
    var emoji2;
    if (Number.isInteger(parseInt(emoji2Id))) {
        let resolveEmoji2 = message.guild.emojis.resolve(emoji2Id);
        emoji2 = resolveEmoji2
    } else { emoji2 = emoji2Id }

    return emoji2;
}

function getEmoji3(message, guildName) {
    let emoji3Id = data.Guilds[guildName].EmojiData["2"];
    var emoji3;
    if (Number.isInteger(parseInt(emoji3Id))) {
        let resolveEmoji3 = message.guild.emojis.resolve(emoji3Id);
        emoji3 = resolveEmoji3
    } else { emoji3 = emoji3Id }

    return emoji3;
}

//print emoji functions for use in embed
function printEmoji1(message, guildName) {
    let emoji1Id = data.Guilds[guildName].EmojiData["0"];
    var emoji1;
    if (Number.isInteger(parseInt(emoji1Id))) {
        let resolveEmoji1 = message.guild.emojis.resolve(emoji1Id);
        emoji1 = resolveEmoji1.toString();
    } else { emoji1 = emoji1Id }

    return emoji1;
}

function printEmoji2(message, guildName) {
    let emoji2Id = data.Guilds[guildName].EmojiData["1"];
    var emoji2;
    if (Number.isInteger(parseInt(emoji2Id))) {
        let resolveEmoji2 = message.guild.emojis.resolve(emoji2Id);
        emoji2 = resolveEmoji2.toString();
    } else { emoji2 = emoji2Id }

    return emoji2;
}

function printEmoji3(message, guildName) {
    let emoji3Id = data.Guilds[guildName].EmojiData["2"];
    var emoji3;
    if (Number.isInteger(parseInt(emoji3Id))) {
        let resolveEmoji3 = message.guild.emojis.resolve(emoji3Id);
        emoji3 = resolveEmoji3.toString();
    } else { emoji3 = emoji3Id }

    return emoji3;
}

//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}