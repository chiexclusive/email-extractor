const email = require('node-email-extractor').default;
const puppeteer = require("puppeteer");
let extraction;


class ExtractorEngine {

	constructor() {
		this.emails = [];
		this.limit = 10;
		this.start = 0;
		this.firstPage = true;
		return new Promise((resolve) => resolve(this));
	}

	startChrome(){
		const instance = this;
		return new Promise(async (resolve, reject) => {
			try{
				instance.chrome = await puppeteer.launch({
					"args": [
						'--no-sandbox',
						'--disable-setuid-sandbox'
					], 
					executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
					headless: false,
					slowMo: 50
				})
				console.log("Chrome has been launched");
				resolve();
			}catch(err){
				console.log(err)
				reject(err)
			}
		})
	}



	async scrapeEmail(url){
		return new Promise(async (resolve) => {
			const data = await email.url(url);
			return resolve(data.emails)
		})
		
	}

	async getEmail(query, limit = this.limit){
		this.limit = limit;
		return new Promise(async (resolve, reject) => {


			//Variables
			var html = "", newMails = [], emailTarget =0

			//Start with google
			if(!this.isGoogleEnd){

				if(!this.googleNextSelector){
					//Start new page
					this.googlePage = await this.chrome.newPage();
					//Go to google with search query
					await this.googlePage.goto( `https://google.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
					this.googleNextSelector =  "#pnnext";
				}else{
					//Click the next button
					console.log("i go here")
					await this.googlePage.click(this.googleNextSelector);
					await this.googlePage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
				}
				//Scrape
				let url = await this.googlePage.evaluate(() => {
					return window.location.href
				})
				//Get emails
				let newMails = await this.scrapeEmail(url);
				console.log(newMails)
				//Clean emails
				newMails = this.cleanEmails(newMails)
				//Store
				if(newMails) this.emails = [...this.emails, ...newMails];
				//Check is the target is met
				let emailTarget = this.emailTarget();
				console.log(this.emails.length)
				console.log(this.limit)
				
				if(emailTarget.isMet) return resolve(this.emails)
				//Check if the next button still exist on the page
				this.isGoogleEnd = await this.googlePage.evaluate(() => {
					return document.querySelector("#pnnext") ? false : true
				})
				console.log(this.isGoogleEnd)

			}



			// //Start with bing
			// if(!this.isBingEnd){

			// 	//Start new page
			// 	const bingPage = await this.chrome.newPage();
			// 	if(!this.bingNextSelector){
			// 		//Go to bing with search query
			// 		await bingPage.goto( `https://bing.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
			// 		this.bingNextSelector =  "#pnnext";
			// 	}else{
			// 		//Click the next button
			// 		await bingPage.click(this.bingNextSelector);
			// 		await bingPage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
			// 	}
			// 	//Scrape
			// 	html = await bingPage.evaluate(() => {
			// 		return document.body.innerHTML
			// 	})
			// 	//Get emails
			// 	newMails = await this.scrapeEmail(html);
			// 	//Clean emails
			// 	newMails = this.cleanEmails(newMails)
			// 	//Store
			// 	if(newMails) this.emails = [...this.emails, ...newMails];
			// 	//Check is the target is met
			// 	emailTarget = this.emailTarget();
			// 	if(emailTarget.isMet) return resolve(this.emails)
			// 	//Check if the next button still exist on the page
			// 	this.isBingEnd = await bingPage.evaluate(() => {
			// 		return document.querySelector(this.bingNextSelector) ? false : true
			// 	})

			// }





			// //Start with yahoo
			// if(!this.isYahooEnd){

			// 	//Start new page
			// 	const yahooPage = await this.chrome.newPage();
			// 	if(!this.yahooNextSelector){
			// 		//Go to yahoo with search query
			// 		await yahooPage.goto( `https://search.yahoo.com/search?p=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
			// 		this.yahooNextSelector =  ".next";
			// 	}else{
			// 		//Click the next button
			// 		await yahooPage.click(this.yahooNextSelector);
			// 		await yahooPage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
			// 	}
			// 	//Scrape
			// 	html = await yahooPage.evaluate(() => {
			// 		return document.body.innerHTML
			// 	})
			// 	//Get emails
			// 	newMails = await this.scrapeEmail(html);
			// 	//Clean emails
			// 	newMails = this.cleanEmails(newMails)
			// 	//Store
			// 	if(newMails) this.emails = [...this.emails, ...newMails];
			// 	//Check is the target is met
			// 	emailTarget = this.emailTarget();
			// 	if(emailTarget.isMet) return resolve(this.emails)
			// 	//Check if the next button still exist on the page
			// 	this.isYahooEnd = await yahooPage.evaluate(() => {
			// 		return document.querySelector(this.yahooNextSelector) ? false : true
			// 	})

			// }



			// //Start with duck duck
			// if(!this.isDuckDuckGoEnd ){

			// 	//Start new page
			// 	const duckDuckGoPage = await this.chrome.newPage();
			// 	if(!this.duckDuckGoNextSelector){
			// 		//Go to duckDuckGo with search query
			// 		await duckDuckGoPage.goto( `https://duckduckgo.com?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
			// 		this.duckDuckGoNextSelector =  ".next";
			// 	}else{
			// 		//Click the next button
			// 		await duckDuckGoPage.click(this.duckDuckGoNextSelector);
			// 		await duckDuckGoPage.waitForResponse(response => response.status === 200)
			// 	}
			// 	//Scrape
			// 	html = await duckDuckGoPage.evaluate(() => {
			// 		return document.body.innerHTML
			// 	})
			// 	//Get emails
			// 	newMails = await this.scrapeEmail(html);
			// 	let uniqueMail = []

			// 	//Get new mails from combined list
			// 	if(newMails.length > this.emails.length){
			// 		const diff = newMails.length - this.emails.length
			// 		let startIndex = newMails.length - diff
			// 		for(let x = 0; x < diff; x++) uniqueMail.push(newMails[startIndex + x])
			// 		newMails = uniqueMail;
			// 	}
			// 	//Clean emails)
			// 	newMails = this.cleanEmails(newMails)
			// 	//Store
			// 	if(newMails) this.emails = [...this.emails, ...newMails];
			// 	//Check is the target is met
			// 	emailTarget = this.emailTarget();
			// 	if(emailTarget.isMet) return resolve(this.emails)
			// 	//Check if the next button still exist on the page
			// 	this.isDuckDuckGoEnd = await duckDuckGoPage.evaluate(() => {
			// 		return document.querySelector(this.duckDuckGoNextSelector) ? false : true
			// 	})

			// }




			// //Start with bing
			// if(!this.isYandexEnd){

			// 	//Start new page
			// 	const yandexPage = await this.chrome.newPage();
			// 	if(!this.yandexNextSelector){
			// 		//Go to yandex with search query
			// 		await yandexPage.goto( `https://yandex.com/search/touch/?text=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
			// 		this.yandexNextSelector =  ".next";
			// 	}else{
			// 		//Click the next button
			// 		await yandexPage.click(this.yandexNextSelector);
			// 		await yandexPage.waitForResponse(response => response.status === 200)
			// 	}
			// 	//Scrape
			// 	html = await yandexPage.evaluate(() => {
			// 		return document.body.innerHTML
			// 	})
			// 	//Get emails
			// 	newMails = await this.scrapeEmail(html);
			// 	let uniqueMail = []
			// 	//Get new mails from combined list
			// 	if(newMails.length > this.emails.length){
			// 		const diff = newMails.length - this.emails.length
			// 		let startIndex = newMails.length - diff
			// 		for(let x = 0; x < diff; x++) uniqueMail.push(newMails[startIndex + x])
			// 		newMails = uniqueMail;
			// 	}
				
			// 	//Clean emails)
			// 	newMails = this.cleanEmails(newMails)
			// 	//Store
			// 	if(newMails) this.emails = [...this.emails, ...newMails];
			// 	//Check is the target is met
			// 	emailTarget = this.emailTarget();
			// 	if(emailTarget.isMet) return resolve(this.emails)
			// 	//Check if the next button still exist on the page
			// 	this.isYandexEnd = await yandexPage.evaluate(() => {
			// 		return document.querySelector(this.yandexNextSelector) ? false : true
			// 	})

			// }


			// this.isYandexEnd && this.isDuckDuckGoEnd && this.isYahooEnd && 

			if(this.isGoogleEnd) resolve(this.emails)
			else {
				console.log("I am iterating now")
				await (() => new Promise((resolve) => setTimeout(() => resolve(), 5000)))();
				let result = await this.getEmail(query, limit)
				return resolve(result)
			}













			
		})
		

	// 	this.formatUrl();
	// 	return this.getEmail(query, limit);
	}


	cleanEmails(emails){
		let cleanedEmails = [];
		emails.map(email => {
			cleanedEmails.push(email.toString().toLowerCase())
		})

		return cleanedEmails;
	}


	emailTarget(){
		//Check not to exceed the limit 
		if(this.emails.length  == this.limit) return {isMet: true}; 
		else if(this.emails.length > this.limit){
			const diff = this.emails.length - this.limit;
			for(let x = 0; x < diff; x++){
				this.emails.pop();
			}

			return {isMet: true}; 

		}else return {isMet: false}
	}

	// formatUrl() {
	// 	if(this.start === 0) this.link.replace(`start=10`, `start=${this.start}`);
	// 	else this.link.replace(`start=${this.start}`, `start=${this.start + 10}`);
	// 	this.start += 10;
	// }
}

let profession, company, emailTypes, domain;


// Test
profession= "engineer"
country= "uk"
emailTypes= "@gmail.com"
domain= "linkedin.com"


extraction = new ExtractorEngine()
extraction
.then(async(instance) => {
	const query = `site:${domain} "${profession}" ${emailTypes} ${country} `
	const limit = 20;
	
	await instance.startChrome()
	const emails = await instance.getEmail(query, limit)
	console.log(emails)
})
.catch((err) => {
	console.log(err)
})

