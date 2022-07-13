import * as cheerio from 'cheerio'
import 'dotenv/config'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Adblocker from 'puppeteer-extra-plugin-adblocker'

export async function fetchHTML(url: string) {

    const data = await puppeteer
        .use(Adblocker({blockTrackers: true}))
        .use(StealthPlugin())
        .launch({
            executablePath: '/usr/bin/chromium',
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disabled-setupid-sandbox",
                "--disable-setuid-sandbox",
                "--no-sandbox",
            ],
            headless: true,
            'ignoreHTTPSErrors': true,
        })
        .then(async browser => {
            const page = await browser.newPage();
            await page.goto(url)
            return [await page.content(), await browser.close()]
        })
    
    // @ts-ignore
    return cheerio.load(data[0])
}