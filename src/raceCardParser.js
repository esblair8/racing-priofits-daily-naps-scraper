const puppeteer = require('puppeteer')
const $ = require('cheerio')

module.exports = url => {
	console.log('Parsing url', url)

	return puppeteer.launch()
		.then(browser => browser.newPage())
		.then(page => page.goto(url).then(() => page.content()))
		.then(html => {
			const raceName = $('.RC-cardHeader__courseDetails', html).first().text().split('\n')[4].trim()
			const handicap = raceName.toLowerCase().includes('handicap')
			const forecastFavourite = $('.RC-raceFooterInfo__runner', html).first().text()
			const runners = $('.RC-headerBox__infoRow__content', html).slice(1, 2).text().trim()
			const distance = $('.RC-cardHeader__distance', html).first().text().trim()
			const date = $('.RC-courseHeader__date', html).first().text().trim().split('\n')[0].toString().trim()
			const time = $('.RC-courseHeader__time', html).text().trim()
			const meeting = $('.RC-courseTime__link', html).first().text().trim().split('  ')[0]
			const country = $('.RC-courseTime__link', html).first().text().trim().split('  ').pop().replace('(', '').replace(')', '')

			return {
				date,
				time,
				country,
				meeting,
				raceName,
				handicap,
				runners,
				distance,
				forecastFavourite
			}
		})
		.catch(err => {
			console.error('Error', err)
			process.exit()
		})
}