#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const raceCardParser = require('./raceCardParser')
const write = require('./selectionFileWriter')
const meetings = require("./meetings")

const raceCards = 'https://www.racingpost.com/racecards/'
const todaysDate = moment().format('YYYY-MM-DD')

const persistToCsv = true

console.log('Analysing Forecast Selections.')
console.time()

const run = async () => {
    try {
        console.info('Starting set up.')
        const browser = await puppeteer.launch({ userDataDir: './data' })
        let page = await browser.newPage()
        setPageToAbortStyleSheetAndJavascriptRequests(page)
        const content = await page.goto(raceCards, { waitUntil: 'networkidle0', timeout: 0 }).then(() => page.content())
        console.info('Set up complete.')
        const links = await parseHtmlForLinks(content)
        const selections = await parseLinksForSelections(links, browser)
        const filePath = await writeSelections(selections)
        console.info(`Forecasts for ${todaysDate} written to ${filePath}`)
        console.timeEnd()
        browser.close()
    } catch (err) {
        console.error('Oops something went wrong', err)
        browser.close()
    }
}

run()

/** 
 * ==================
 * HELPER FUNCTIONS 
 * ==================
 **/ 
 
const setPageToAbortStyleSheetAndJavascriptRequests = async page => {
    await page.setRequestInterception(true)
    page.on('request', (request) => {
        if (request.resourceType() === 'document') {
            request.continue()
        } else {
            request.abort()
        }
    })
}

const parseHtmlForLinks = (html) => {
    console.info('Parsing html.')
    return $('.RC-meetingItem__link', html)
        .filter(function () {
            return $(this).attr().href != undefined
        })
        .map(function () {
            return $(this).attr().href
        })
}

const parseLinksForSelections = async (links, browser) => {
    const chunkedUrls = prepArrayOfLinks(links)

    const selections_1 = await resolveListOfUrls(1, chunkedUrls[0], browser)
    const selections_2 = await resolveListOfUrls(2, chunkedUrls[1], browser)
    const selections_3 = await resolveListOfUrls(3, chunkedUrls[2], browser)
    const selections_4 = await resolveListOfUrls(4, chunkedUrls[3], browser)
    const selections_5 = await resolveListOfUrls(5, chunkedUrls[4], browser)
    const selections_6 = await resolveListOfUrls(6, chunkedUrls[5], browser)

    return [
        ...selections_1,
        ...selections_2,
        ...selections_3,
        ...selections_4,
        ...selections_5,
        ...selections_6,
    ]
}

const writeSelections = (selections) => {
    if (persistToCsv) return write(selections, 'forecasts.csv')
    else return console.log(selections)
}

const chunkArray = (arr, n) => {
    var chunkLength = Math.max(arr.length / n, 1);
    var chunks = [];
    for (var i = 0; i < n; i++) {
        if (chunkLength * (i + 1) <= arr.length) chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
    }
    return chunks;
}

const resolveListOfUrls = async (i, urls, browser) => {
    const selections = urls.map(link => raceCardParser(`https://www.racingpost.com${link}/pro`, browser))
    console.log(`...resolving batch ${i} of race cards`)
    const selectionsResolved = await Promise.all(selections)
    return selectionsResolved
}

const prepArrayOfLinks = (links) => {
    const raceCardInfo = links.toArray().filter(link => meetings.includes(link.split("/")[3]))
    const uniqueRaceCardInfo = [...new Set(raceCardInfo)]
    const chunkedUrls = chunkArray(uniqueRaceCardInfo, 6)
    return chunkedUrls
}
