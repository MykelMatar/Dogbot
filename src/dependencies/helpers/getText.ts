import {CheerioAPI} from "cheerio";

/**
 * user cheerio to get html text from webpage
 *
 * @param $
 * @param selector
 * @param singleLine set true if you only need to get 1 line of text
 */
export function getText($: CheerioAPI, selector: string, singleLine?: boolean): string[] | string {
    if (singleLine == undefined) singleLine = false;
    if (singleLine) {
        let text: string
        $(selector).each(function(i) {
            text = $(this).text();
        });
        return text
    } else {
        let textArray: string[] = []
        $(selector).each(function(i) {
            textArray[i] = $(this).text();
        });
        return textArray
    }
}