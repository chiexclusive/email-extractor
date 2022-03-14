const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const useProxy = require("puppeteer-page-proxy")
const userAgentAnon = require("puppeteer-extra-plugin-anonymize-ua")
puppeteer.use(stealth());
puppeteer.use(userAgentAnon());


const start = async () => {
	let chrome, googlePage, bingPage, yahooPage, duckDuckGoPage;
	const options = {
		"args": [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--use-gl=egl'
		], 
		headless: true,
		slowMo: 50,
		userDataDir: "./user_data2",
		ignoreDefaultArgs: ['--disable-extension'],
		ignoreHTTPSErrors: true,
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
	}

	chrome = await puppeteer.launch(options)
	chrome = await chrome.createIncognitoBrowserContext()

	// //Start new page
	googlePage = await chrome.newPage();
	bingPage = await chrome.newPage();
	console.log("Chrome has been launched");

	try{
		await googlePage.goto("https://bing.com", {waitUntil: "networkidle0", timeout: 1000000});
		console.log("chrome was successfully fetched")
	}catch(err){
		console.log(err)
	}
}


start()