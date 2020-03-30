#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const raceCardParser = require('./raceCardParser')
const write = require('./selectionFileWriter')

const raceCards = 'https://www.racingpost.com/racecards/'
const todaysDate = moment().format('YYYY-MM-DD')

console.log('Analysing Forecast Selections.')

puppeteer.launch()
    .then(browser => {
        console.info('Starting set up.')
        return browser.newPage()
    })
    .then(page => {
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
        const raceCardInfo = links.toArray().map(link => raceCardParser(`https://www.racingpost.com${link}/pro`))
        return Promise.all(raceCardInfo)
    })
    .then(selections => write(selections, 'forecasts.csv'))
    .then(filePath => {
        console.info(`Forecasts for ${todaysDate} written to ${filePath}`)
        process.exit()
    })
    .catch(err => {
        console.error('Error', err)
        process.exit()
    })
