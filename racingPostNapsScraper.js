#!/usr/bin/env node

const puppeteer = require('puppeteer')
const $ = require('cheerio')
const fs = require('fs')
const moment = require('moment')
const converter = require('json-2-csv')
const path = require('path')
const url = 'https://www.racingpost.com/tipping/naps-table'
const todaysDate = moment().format('YYYY-MM-DD')

puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => page.goto(url)
        .then(() => page.content())
    )
    .then(html => {
        return $('.tn-napsTable__row', html).map(function () {
            return {
                course: $('.tn-napsTable__crs', this).text(),
                time: $('.tn-napsTable__time', this).text(),
                selection: $('.tn-napsTable__naps', this).text().replace('right', '').trim()
            }
        })
    })
    .then(naps => converter.json2csvAsync(naps.toArray())
        .then(function (csv) {
            const filePath = getDocumentsNapsPath()
            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath)
            fs.writeFileSync(`${filePath}/naps-${todaysDate}.csv`, csv, { flag: 'w' })
        })
    )
    .then(() => process.exit())
    .catch(err => console.log('Error', err))


const getDocumentsNapsPath = () => `/${path.parse(process.cwd()).dir.split('/').slice(1, 3).join('/')}/Documents/Naps`
