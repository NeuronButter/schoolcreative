const puppeteer = require('puppeteer');
const himalaya = require('himalaya');
require('dotenv').config();

(async () => {
	// Setup Browser
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(process.env.URL);
	await page.type('#inputEmail', process.env.USER);
	await page.type('#password', process.env.PASSWORD);
	await page.click('.center [type=submit]');
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

	// Fetch Timetable Data
	let html = await page.evaluate(() => {
		let element = document.querySelector('.timetable tbody');
		return element.innerHTML;
	});
	html = himalaya.parse(html);
	browser.close();

	// Get today's periods
	let valid = [1, 2, 3, 4];
	let periods = [];

	for (var i = 0, len = html.length; i < len; i++) {
		try {
			if (valid.some((e) => e == html[i]?.children[1]?.children[0]?.content.toString())) {
				periods.push({
					id: i,
					period: html[i]?.children[1]?.children[0]?.content.toString(),
					element: html[i]
				});
			}
		} catch (error) {}
	}

	// Format Nicely
	let formatted = []
	let msg = "You have "

	for (var i = 0, len = periods.length; i < len; i++) {
		let period = periods[i].element.children[3].children[1].children[1].children[1].children[1].children[0].content;
		period = period.split(' ')[0];
		if (period.match(/Psych/g)) period = 'Psychology';
		// formatted.push(period)
		if (i == len - 1) {
			msg += `and ${period}.`
			break
		}
		msg += `${period}, `
	}

	console.log(msg)
})();
