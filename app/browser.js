const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const useProxy = require("puppeteer-page-proxy")
const userAgentAnon = require("puppeteer-extra-plugin-anonymize-ua")
puppeteer.use(stealth());
puppeteer.use(userAgentAnon());

function startBrowser(){
	return new Promise(async (resolve, reject) => {
		try{
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
				ignoreDefaultArgs: ['--disable-extension']
			}

			if(process.env.NODE_ENV.toString().trim() === "development"){
				options['executablePath'] = "C:/Program Files/Google/Chrome/Application/chrome.exe"
				options['headless'] = false
			}
			chrome = await puppeteer.launch(options)
			chrome = await chrome.createIncognitoBrowserContext()

			// //Start new page
			googlePage = await chrome.newPage();
			bingPage = await chrome.newPage();
			yahooPage = await chrome.newPage();
			duckDuckGoPage = await chrome.newPage();
			console.log("Chrome has been launched");

			resolve({googlePage, bingPage, yahooPage, duckDuckGoPage});
		}catch(err){
			console.log(err)
			reject(err)
		}
	})
}

const pages = startBrowser();
module.exports = pages;