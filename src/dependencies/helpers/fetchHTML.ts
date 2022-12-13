import * as cheerio from 'cheerio'
import {CheerioAPI} from 'cheerio'
import 'dotenv/config'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Adblocker from 'puppeteer-extra-plugin-adblocker'

/**
 * use puppeteer to get html screenshot of a url
 *
 * @param url
 */
export async function fetchHTML(url: string): Promise<CheerioAPI> {
    const data = await puppeteer
        .use(Adblocker({blockTrackers: true}))
        .use(StealthPlugin())
        .launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser', // for raspi deployment
            ignoreHTTPSErrors: true,
            args: settings,
        })
        .then(async browser => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            // ignore images and CSS
            page.on('request', (req) => {
                if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
                    req.abort();
                } else {
                    req.continue();
                }
            });
            await page.goto(url, {waitUntil: 'domcontentloaded'})
            return [await page.content(), await browser.close()]
        });
    return cheerio.load(data[0] as string)
}

const settings: Array<string> = [ // minimal settings
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];