import * as cheerio from 'cheerio'
import 'dotenv/config'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Adblocker from 'puppeteer-extra-plugin-adblocker'

export async function fetchHTML(url: string) {

    puppeteer.use(Adblocker({blockTrackers: true}))
    // puppeteer
    //     .use(StealthPlugin())
    //     .launch({'ignoreHTTPSErrors': true})
    //     .then(async browser => {
    //         const page = await browser.newPage();
    //         await page.goto(url)
    //         const pageData = await page.content()
    //         console.log(pageData)
    //     })
    const getData = await puppeteer.use(StealthPlugin())
        .launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disabled-setupid-sandbox",
                "--disable-setuid-sandbox",
                "--no-sandbox",
            ],
            headless: true,
            'ignoreHTTPSErrors': true,
            // executablePath: '/usr/bin/google-chrome'
        })
        .then(async browser => {
            const page = await browser.newPage();
            await page.goto(url)
            return await page.content()
        })

    return cheerio.load(getData)
}

// .launch ({args: [
//     `--proxy-server=http://scraperapi:${process.env.SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001`
// ]
// })

// await page.authenticate({
//     username: 'scraperapi',
//     password: process.env.SCRAPER_API_KEY,
// })