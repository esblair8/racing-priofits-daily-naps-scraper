#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const write = require('./selectionFileWriter')

const url = 'https://www.racingtips.com/tips/'
const todaysDate = moment().format('YYYY-MM-DD')

console.log('Analysing racingtips.com selections.')

puppeteer.launch()
    .then(browser => {
        console.info('Starting set up.')
        return browser.newPage()
    })
    .then(page => {
        console.log('url', url)
        const content = page.goto(url).then(() => page.content())
        console.info('Set up complete.')
        return content
    })
    .then(html => {
        console.info('Parsing html.')
        const country = $('.bets > h2', html).text().split(' ')[0]
        return $('tr', html).map(function () {
            const raceDetails = $('td', this).slice(1, 2).text().split('-')
            const selection = raceDetails[0].split(/[0-9]/)[0].trim()
            const time = raceDetails[0].split(/^[^0-9]+/)[1].trim()
            const meeting = raceDetails[1].trim()
            return {
                country,
                meeting,
                date: todaysDate,
                time,
                selection
            }
        })
    })
    .then(selections => {
        const uniqueSelections = removeDuplicates(selections.toArray(), 'selection')
        console.log('uniqueSelections', uniqueSelections)
        return write(uniqueSelections, 'racing-tips.csv')
    })
    .then(documentPath => {
        console.info(`Sel
        
        
        ections from ${url} for ${todaysDate} written to ${documentPath}`)
        process.exit()
    })
    .catch(err => console.log('Error', err))

const removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
    })
}