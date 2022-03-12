const email = require('node-email-extractor').default;
const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const useProxy = require("puppeteer-page-proxy")
const userAgentAnon = require("puppeteer-extra-plugin-anonymize-ua")
puppeteer.use(stealth());
puppeteer.use(userAgentAnon());


// const PROXY_SERVER = [
// 	"103.139.47.250:8080"	
// ]


class ExtractorEngine {

	constructor() {
		this.emails = [];
		this.limit = 10;
		this.start = 0;
		this.firstPage = true;
		return new Promise((resolve) => resolve(this));
	}


	getRandomIndex(num){
		return Math.floor((Math.random() * num))
	}

	startChrome(){
		// const randomIndex = this.getRandomIndex(PROXY_SERVER.length)
		const instance = this;
		return new Promise(async (resolve, reject) => {
			try{
				const options = {
					"args": [
						'--no-sandbox',
						'--disable-setuid-sandbox',
					], 
					headless: true,
					slowMo: 50,
					userDataDir: "./user_data2"
				}

				if(process.env.NODE_ENV.toString().trim() === "development"){
					options['executablePath'] = "C:/Program Files/Google/Chrome/Application/chrome.exe"
					options['headless'] = false
				}
				instance.chrome = await puppeteer.launch(options)
				instance.chrome = await instance.chrome.createIncognitoBrowserContext()


				// //Start new page
				instance.googlePage = await instance.chrome.newPage();
				instance.bingPage = await instance.chrome.newPage();
				instance.yahooPage = await instance.chrome.newPage();
				instance.duckDuckGoPage = await instance.chrome.newPage();
		
				console.log("Chrome has been launched");
				resolve();
			}catch(err){
				console.log(err)
				reject(err)
			}
		})
	}



	async scrapeEmail(html){
		return new Promise(async (resolve) => {
			// console.log(html)
			const data = email.text(html);
			return resolve(data.emails)
		})
		
	}

	async getEmail(query, limit){
		this.limit = limit;
		return new Promise(async (resolve, reject) => {

			try{

				var html = "", newMails = [], emailTarget = 0, selector= ""

				//Start with google
				if(!this.isGoogleEnd){
					await this.googlePage.bringToFront();
					if(!this.googleNextSelector){
						
						// await useProxy(this.googlePage, PROXY_SERVER[0])
						//Go to google with search query
						await this.googlePage.goto( `https://google.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						console.log("page load end");
						this.googleNextSelector =  "#pnnext";
					}else{
						//Click the next button
						await this.googlePage.click(this.googleNextSelector);
						await this.googlePage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
					}
					//Scrape
					html = await this.googlePage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					// html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					// html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ").replaceAll("[", " ").replaceAll("]", " ");
					// html = html.toString();
					
					//Get emails
					newMails = await this.scrapeEmail(html)
					console.log(newMails)
				
					//Clean emails
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					console.log(this.emails.length)
					console.log(this.limit)
					
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isGoogleEnd = await this.googlePage.evaluate(() => {
						return document.querySelector("#pnnext") ? false : true
					})
				}



				//Start with bing
				if(!this.isBingEnd){
					await this.bingPage.bringToFront();
					if(!this.bingNextSelector){
						//Go to bing with search query
						await this.bingPage.goto( `https://bing.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.bingNextSelector =  ".sb_pagN";
					}else{
						//Click the next button
						await this.bingPage.click(this.bingNextSelector);
						await this.bingPage.waitForSelector(".sb_pagN")
						console.log("done with navigation")
					}
					//Scrape
					html = await this.bingPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ").replaceAll("[", " ").replaceAll("]", " ");
					html = html.toString();

					//Get emails
					newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g)
					//Clean emails
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isBingEnd = await this.bingPage.evaluate(() => {
						return document.querySelector(".sb_pagN") ? false : true
					})
					console.log(this.isBingEnd)
				}





				//Start with yahoo
				if(!this.isYahooEnd){
					await this.yahooPage.bringToFront();
					if(!this.yahooNextSelector){
						//Go to yahoo with search query
						await this.yahooPage.goto( `https://search.yahoo.com/search?p=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.yahooNextSelector =  ".next";
					}else{
						//Click the next button
						await this.yahooPage.click(this.yahooNextSelector);
						await this.yahooPage.waitForSelector(".next");
					}
					//Scrape
					html = await this.yahooPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ");
					html = html.toString();
				
					//Get emails
					newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g)
					//Clean emails
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isYahooEnd = await this.yahooPage.evaluate(() => {
						return document.querySelector(".next") ? false : true
					})
				}



				//Start with duck duck
				if(!this.isDuckDuckGoEnd ){
					await this.duckDuckGoPage.bringToFront();
					if(!this.duckDuckGoNextSelector){
						//Go to duckDuckGo with search query
						await this.duckDuckGoPage.goto( `https://duckduckgo.com?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.duckDuckGoNextSelector =  ".result--more";
					}else{
						//Click the next button
						await Promise.all([
							this.duckDuckGoPage.evaluate(() => {
								return new Promise((resolve, reject) => {
									const target = document.querySelector("#links")
									const options = {childList: true, subtree: true}
									const callback = (mutationsList, observer) => {
										return resolve(true);
									}

									const observer = new MutationObserver(callback);
									observer.observe(target, options);
								})
							}),
							this.duckDuckGoPage.click(this.duckDuckGoNextSelector)
						]);
					}
					//Scrape
					html = await this.duckDuckGoPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ").replaceAll("[", " ").replaceAll("]", " ");
					html = html.toString();

					//Get emails
					newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g)
					let uniqueMail = []

					if(!this.previousDuckDuckEmailLength) this.previousDuckDuckEmailLength = 0;

					//Get new mails from combined list
					if(newMails.length > this.previousDuckDuckEmailLength){
						const diff = newMails.length - this.previousDuckDuckEmailLength
						let startIndex = newMails.length - diff
						for(let x = 0; x < diff; x++) uniqueMail.push(newMails[startIndex + x])
						newMails = uniqueMail;
					}

					this.previousDuckDuckEmailLength += newMails.length;
					//Clean emails)
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isDuckDuckGoEnd = await this.duckDuckGoPage.evaluate(() => {
						return document.querySelector(".result--more") ? false : true
					})
					console.log(this.isDuckDuckGoEnd)
				}




				// //Start with yandex
				// if(!this.isYandexEnd){

				// 	if(!this.yandexNextSelector){
				// 		//Go to yandex with search query
				// 		await this.yandexPage.goto( `https://yandex.com/search/touch/?text=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
				// 		this.yandexNextSelector =  ".pager__item_kind_next";
				// 	}else{
				// 		//Click the next button
				// 		await this.yandexPage.click(this.yandexNextSelector);
				// 		await this.yandexPage.waitForNavigation()
				// 	}
				// 	//Scrape
				// 	html = await this.yandexPage.evaluate(() => {
				// 		return document.querySelector("body").innerHTML;
				// 	})

				// 	// html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");

				// 	//Get emails
				// 	newMails = await this.scrapeEmail(html);
				// 	let uniqueMail = []

				// 	if(!this.previousYandexEmailLength) this.previousYandexEmailLength = 0;

				// 	//Get new mails from combined list
				// 	if(newMails.length > this.previousYandexEmailLength){
				// 		const diff = newMails.length - this.previousYandexEmailLength
				// 		let startIndex = newMails.length - diff
				// 		for(let x = 0; x < diff; x++) uniqueMail.push(newMails[startIndex + x])
				// 		newMails = uniqueMail;
				// 	}

				// 	this.previousYandexEmailLength += newMails.length;
					
				// 	//Clean emails)
				// 	newMails = this.cleanEmails(newMails)
				// 	//Store
				// 	if(newMails) this.emails = [...this.emails, ...newMails];
				// 	//Check is the target is met
				// 	emailTarget = this.emailTarget();
				// 	if(emailTarget.isMet) return resolve(this.emails)
				// 	//Check if the next button still exist on the page
				// 	this.isYandexEnd = await this.yandexPage.evaluate(() => {
				// 		return document.querySelector(".pager__item_kind_next") ? false : true
				// 	})

				// }


				if(this.isGoogleEnd && this.isBindEnd && this.isYandexEnd && this.isDuckDuckGoEnd && this.isYahooEnd) resolve(this.emails)
				else {
					// return resolve(this.emails)
					console.log(this.emails)
					console.log("I am iterating now")
					await (() => new Promise((resolve) => setTimeout(() => resolve(), 3000)))();
					let result = await this.getEmail(query, limit)
					return resolve(result)
				}

			}catch(err){
				reject(err);
				console.log(err)

			}	
		})
	}


	cleanEmails(emails){
		let cleanedEmails = [];
		if(emails ==null) return []
		emails.map(email => {
			email = email.replace(/^[\:]+/, "")
			if(!/\.js$/i.test(email) && !/\.css$/i.test(email)  && !/\.svg$/i.test(email) ) cleanedEmails.push(email.toString().toLowerCase())
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

	exitBrowser(){
		const instance = this;
		return new Promise(async (resolve, reject) => {
			await instance.chrome.close();
			resolve()
		})
	}
}


module.exports = ExtractorEngine;


// const extraction = new ExtractorEngine()

// extraction
// .then(async(instance) => {
// 	const query = `site:linkedin.com "ceo", @gmail.com uk`			
// 	await instance.startChrome()
// 	const emails = await instance.getEmail(query, 100)

// 	console.log(emails)
	
// })
// .catch((err) => {
// 	console.log(err)
// })


