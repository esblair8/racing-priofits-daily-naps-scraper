#!/usr/bin/env node
const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const raceCardParser = require('./raceCardParser')
const write = require('./selectionFileWriter')

const raceCards = 'https://www.racingpost.com/racecards/'
const todaysDate = moment().format('YYYY-MM-DD')

const meetings = [
    'ascot',
    'ayr',
    'bath',
    'beverley',
    'beverly',
    'chelmsford-aw',
    'chepstow',
    'doncaster',
    'goodwood',
    'hamilton',
    'haydock',
    'kempton-aw',
    'leicester',
    'leicester',
    'lingfield-aw',
    'newbury',
    'newcastle',
    'newmarket',
    'pontefract',
    'redcar',
    'ripon',
    'sandown',
    'thirsk',
    'windsor',
    'wolverhampton-aw',
    'yarmouth'
]

require('events').EventEmitter.defaultMaxListeners = 100

console.log('Analysing Forecast Selections.')
console.time()
puppeteer.launch({ userDataDir: './data' })
    .then(browser => {
        console.info('Starting set up.')
        return browser.newPage()
    })
    .then(async page => {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'document') {
                request.continue();
            } else {
                request.abort();
            }
        })
        const content = page.goto(raceCards, { waitUntil: 'networkidle0', timeout: 0 }).then(() => page.content())
        console.info('Set up complete.')
        return content
    })
    .then(html => {
        console.info('Parsing html.')
        return $('.RC-meetingItem__link', html)
            .filter(function () {
                return $(this).attr().href != undefined
            })
            .map(function () {
                return $(this).attr().href
            })
    })
    .then(async links => {
        const raceCardInfo = links.toArray().filter(link => meetings.includes(link.split("/")[3]))
        const uniqueRaceCardInfo = [...new Set(raceCardInfo)]
        const chunkedUrls = chunkArray(uniqueRaceCardInfo, 6)

        const selections_1 = chunkedUrls[0].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 1 of race cards')
        const selections_1_resolved = await Promise.all(selections_1)

        const selections_2 = chunkedUrls[1].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 2 of race cards')
        const selections_2_resolved = await Promise.all(selections_2)

        const selections_3 = chunkedUrls[2].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 3 of race cards')
        const selections_3_resolved = await Promise.all(selections_3)

        const selections_4 = chunkedUrls[3].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 4 of race cards')
        const selections_4_resolved = await Promise.all(selections_4)

        const selections_5 = chunkedUrls[4].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 5 of race cards')
        const selections_5_resolved = await Promise.all(selections_5)

        const selections_6 = chunkedUrls[5].map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        console.log('...resolving batch 6 of race cards')
        const selections_6_resolved = await Promise.all(selections_6)

        return [
            ...selections_1_resolved,
            ...selections_2_resolved,
            ...selections_3_resolved,
            ...selections_4_resolved,
            ...selections_5_resolved,
            ...selections_6_resolved
        ]
    })
    .then(selections => {
        return write(selections, 'forecasts.csv')
    })
    .then(filePath => {
        console.info(`Forecasts for ${todaysDate} written to ${filePath}`)
        console.timeEnd()
        process.exit()
    })
    .catch(err => {
        console.error('Error', err)
    })



function chunkArray(arr, n) {
    var chunkLength = Math.max(arr.length / n, 1);
    var chunks = [];
    for (var i = 0; i < n; i++) {
        if (chunkLength * (i + 1) <= arr.length) chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
    }
    return chunks;
}