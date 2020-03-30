#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')

const write = require('./selectionFileWriter')

const url = 'https://www.racingpost.com/tipping/naps-table'
const todaysDate = moment().format('YYYY-MM-DD')

console.log('Analysing Naps Table.')

puppeteer.launch()
    .then(browser => {
        console.info('Starting set up.')
        return browser.newPage()
    })
    .then(page => {
        const content = page.goto(url).then(() => page.content())
        console.info('Set up complete.')
        return content
    })
    .then(html => {
        console.info('Parsing html.')
        return $('.tn-napsTable__row', html).map(function () {
            return {
                course: $('.tn-napsTable__crs', this).text(),
                time: $('.tn-napsTable__time', this).text(),
                selection: $('.tn-napsTable__naps', this).text().replace('right', '').trim()
            }
        })
    })
    .then(selections => write(selections.toArray(), 'naps.csv'))
    .then(documentPath => {
        console.info(`Naps for ${todaysDate} written to ${documentPath}`)
        process.exit()
    })
    .catch(err => console.log('Error', err))
