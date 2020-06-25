const puppeteer = require('puppeteer')
const $ = require('cheerio')
const moment = require('moment')
const stats = require('stats-lite')
const todaysDate = moment().format('YYYY-MM-DD')

module.exports = (url) => {
	console.log('Parsing url', url)

	return puppeteer.launch({ userDataDir: './.data' })
		.then(browser => {
			const page = browser.newPage()
			return page
		})
		.then(page => page.goto(url, { waitUntil: 'load', timeout: 0 }).then(() => page.content()))
		.then(html => {

			const raceName = $('[data-test-selector=RC-header__raceInstanceTitle]', html).first().text().trim()
			const handicap = raceName.toLowerCase().includes('handicap')
			const forecastFavourite = $('[data-test-selector=RC-bettingForecast_link]', html).first().text().trim()
			const runners = $('.RC-headerBox__infoRow__content', html).slice(1, 2).text().replace(/\s\s+/g, ' ').trim()
			const distance = $('.RC-cardHeader__distance', html).first().text().trim()
			const date = todaysDate
			const time = $('.RC-courseHeader__time', html).text().trim()
			const meeting = $('[data-test-selector=RC-courseHeader__name]', html).first().text().trim()

			return {
				date,
				time,
				meeting,
				runners,
				distance,
				forecastFavourite,
				raceName,
				handicap,
				url
			}
		})
		.catch(err => {
			console.error('Error', err)
		})
}

/**
 *  FUNCTION NOT USED YET- NEED TO SUBSCRIBE TO RACINGPOST WHEN JUMS SEASON STARTS
 * 	CANT GET ACCESS TO /PRO ENDPOINT WITHOUT BEING A PADI SUBSCRIBER
 */
function addExtraDataForNationalHuntSystem(html, row, forecastFavourite) {

	const rprData = $('[data-test-selector=RC-postdata__rprColumn]', html).text().first().trim()
	const rprMax = Math.max(rprData)
	const rprMin = Math.min(rprData)
	const rprRange = rprMax - rprMin
	const rprMedian = stats.median(rprData)
	const rprMean = stats.mean(rprData)
	const postDataFavourite = $('[data-test-selector=RC-selection__horseName]', html).first().text().trim()
	const tipCount = $('.RC-selections__horse', html).toArray() //TODO filter for row.forecastFavourite and get the number of tips.
	// distinctTips = //TODO: count distinct number of tips, by name)
	//const tipCountLte5 = tipCount <= 5

	row.rpPdIsTheSame = postDataFavourite === forecastFavourite
	row.postDataFavourite = postDataFavourite
	row.rprMin = rprMin
	row.rprMax = rprMax
	row.rprRange = rprRange
	row.rprMean = rprMean
	row.rprMedian = rprMedian

	return row
}

/**
 * FUNCTION NOT USED
 */
function delay(time) {
	return new Promise(function (resolve) {
		setTimeout(resolve, time)
	})
}