#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')
const write = require('./selectionFileWriter')
const url = 'www.example.com/'
const todaysDate = moment().format('YYYY-MM-DD')

console.log('Analysing racingtips.com selections.')

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
        console.info('Parsing html.', html)
        //TODO: add implementation here
    })
    .then(selections => write(selections.toArray(), 'naps.csv'))
    .then(documentPath => {
        console.info(`Selections from ${url} for ${todaysDate} written to ${documentPath}`)
        process.exit()
    })
    .catch(err => console.log('Error', err))