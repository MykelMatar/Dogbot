import * as cheerio from 'cheerio'
import axios from "axios";

export async function fetchHTML(url: string) {
    const {data} = await axios.get(url)
    return cheerio.load(data)
}