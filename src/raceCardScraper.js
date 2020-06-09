#!/usr/bin/env node
const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const raceCardParser = require('./raceCardParser')
const write = require('./selectionFileWriter')

const raceCards = 'https://www.racingpost.com/racecards/'
const todaysDate = moment().format('YYYY-MM-DD')

const meetings = [
    'chelmsford-aw',
    'lingfield-aw',
    'haydock',
    'wolverhampton-aw',
    'newcastle',
    'pontefract',
    'yarmouth',
    'kempton-aw',
    'beverly',
    'newbury',
    'doncaster',
    'sandown',
    'leicester',
    'goodwood',
    'newmarket'
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
        const content = page.goto(raceCards).then(() => page.content())
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
    .then(links => {
        const raceCardInfo = links.toArray()
            .filter(link => meetings.includes(link.split("/")[3]))
            .map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))

        return Promise.all(raceCardInfo)
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
    