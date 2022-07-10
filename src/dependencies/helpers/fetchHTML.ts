import * as cheerio from 'cheerio'
import axios from "axios";
import 'dotenv/config'

export async function fetchHTML(url: string) {
    let config = {
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        },
        proxy: {
            protocol: 'http',
            host: `proxy-server.scraperapi.com`,
            port: 8001,
            auth: {
                username: 'scraperapi', 
                password: `${process.env.SCRAPER_API_KEY}`
            }
        }
    }

    const {data} = await axios.post(url, {}, config)
    return cheerio.load(data)
}
