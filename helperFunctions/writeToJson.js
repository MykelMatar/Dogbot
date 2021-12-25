const fs = require('fs');

/**
 * writes data to data.JSON file
 * @param  {string} data
 */
 function writeToJson(data) {
    fs.writeFile("./data.json", JSON.stringify(data, null, 4), function (err) {
      if (err) throw err;
    });
  }

  module.exports = writeToJson;