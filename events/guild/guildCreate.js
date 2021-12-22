const data = require('d:/Github/Dogbot/data.json'); // change for your PC path
const fs = require('fs');  

module.exports = async function(client, guild) {
    if (!("Guilds" in data)) {
        var gData = {
            Guilds: {}
        };
        writeToJson(gData);
    }

    let guildName = guild.name.replace(/\s+/g, ""); //removes whitespace from string
    let newJson = {
        ServerData: {
            serverId: guild.id
        },
        MCData : {
            serverList: {}
        },
        EmbedData: {
            Title: "peepee",
            Fields: {
                Game: "N/A",
                Time: "N/A",
                Timer: "N/A",
            },
            id: "0"
        },
        EmojiData: {
            0: "✅", //default emojis
            1: "👀",
            2: "❌"
        }
    };

    data.Guilds[guildName] = newJson;
    writeToJson(data);
}



//writes to data.json
function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}