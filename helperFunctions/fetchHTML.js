const cheerio = require('cheerio');
const axios = require('axios');


/**
 * sends a message and collects the response
 * @param  {string} url
 */

async function fetchHTML(url) {
    const { data } = await axios.get(url)
    return cheerio.load(data)
  }

  module.exports = fetchHTML;