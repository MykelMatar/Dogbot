const cheerio = require('cheerio');
const axios = require('axios');

async function fetchHTML(url) {
    const { data } = await axios.get(url)
    return cheerio.load(data)
  }

  module.exports = fetchHTML;