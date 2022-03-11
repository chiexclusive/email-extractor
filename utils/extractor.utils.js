const email = require('node-email-extractor').default;
const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const useProxy = require("puppeteer-page-proxy")
const userAgentAnon = require("puppeteer-extra-plugin-anonymize-ua")
puppeteer.use(stealth());
puppeteer.use(userAgentAnon());

const PROXY_SERVER = [
	"103.139.47.250:8080"	
]


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
		const randomIndex = this.getRandomIndex(PROXY_SERVER.length)
		const instance = this;
		return new Promise(async (resolve, reject) => {
			try{
				const options = {
					"args": [
						'--no-sandbox',
						'--disable-setuid-sandbox',
					], 
					headless: true,
					slowMo: 100
				}

				if(process.env.NODE_ENV.toString().trim() === "development"){
					options['executablePath'] = "C:/Program Files/Google/Chrome/Application/chrome.exe"
					options['headless'] = false
					options["slowMo"] = 50
				}
				instance.chrome = await puppeteer.launch(options)
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
			const data = email.text(html);
			return resolve(data.emails)
		})
		
	}

	async getEmail(query, limit = this.limit){
		this.limit = limit;
		return new Promise(async (resolve, reject) => {

			try{

				var html = "", newMails = [], emailTarget = 0

				//Start with google
				if(!this.isGoogleEnd){

					if(!this.googleNextSelector){
						//Start new page
						this.googlePage = await this.chrome.newPage();
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

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					
					//Get emails
					newMails = await this.scrapeEmail(html);
				
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

					//Start new page
					this.bingPage = await this.chrome.newPage();
					if(!this.bingNextSelector){
						//Go to bing with search query
						await this.bingPage.goto( `https://bing.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.bingNextSelector =  "#pnnext";
					}else{
						//Click the next button
						await this.bingPage.click(this.bingNextSelector);
						await this.bingPage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
					}
					//Scrape
					html = await this.bingPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");

					//Get emails
					newMails = await this.scrapeEmail(html);
					//Clean emails
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isBingEnd = await this.bingPage.evaluate(() => {
						return document.querySelector(this.bingNextSelector) ? false : true
					})
				}





				//Start with yahoo
				if(!this.isYahooEnd){

					//Start new page
					this.yahooPage = await this.chrome.newPage();
					if(!this.yahooNextSelector){
						//Go to yahoo with search query
						await this.yahooPage.goto( `https://search.yahoo.com/search?p=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.yahooNextSelector =  ".next";
					}else{
						//Click the next button
						await this.yahooPage.click(this.yahooNextSelector);
						await this.yahooPage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
					}
					//Scrape
					html = await this.yahooPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");

					//Get emails
					newMails = await this.scrapeEmail(html);
					//Clean emails
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isYahooEnd = await this.yahooPage.evaluate(() => {
						return document.querySelector(this.yahooNextSelector) ? false : true
					})
				}



				//Start with duck duck
				if(!this.isDuckDuckGoEnd ){

					//Start new page
					this.duckDuckGoPage = await this.chrome.newPage();
					if(!this.duckDuckGoNextSelector){
						//Go to duckDuckGo with search query
						await this.duckDuckGoPage.goto( `https://duckduckgo.com?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.duckDuckGoNextSelector =  ".next";
					}else{
						//Click the next button
						await this.duckDuckGoPage.click(this.duckDuckGoNextSelector);
						await this.duckDuckGoPage.waitForResponse(response => response.status === 200)
					}
					//Scrape
					html = await this.duckDuckGoPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
					//Get emails
					newMails = await this.scrapeEmail(html);
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
						return document.querySelector(this.duckDuckGoNextSelector) ? false : true
					})
				}




				//Start with yandex
				if(!this.isYandexEnd){

					//Start new page
					this.yandexPage = await this.chrome.newPage();
					if(!this.yandexNextSelector){
						//Go to yandex with search query
						await this.yandexPage.goto( `https://yandex.com/search/touch/?text=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
						this.yandexNextSelector =  ".next";
					}else{
						//Click the next button
						await this.yandexPage.click(this.yandexNextSelector);
						await this.yandexPage.waitForResponse(response => response.status === 200)
					}
					//Scrape
					html = await this.yandexPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
					})

					html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");

					//Get emails
					newMails = await this.scrapeEmail(html);
					let uniqueMail = []

					if(!this.previousYandexEmailLength) this.previousYandexEmailLength = 0;

					//Get new mails from combined list
					if(newMails.length > this.previousYandexEmailLength){
						const diff = newMails.length - this.previousYandexEmailLength
						let startIndex = newMails.length - diff
						for(let x = 0; x < diff; x++) uniqueMail.push(newMails[startIndex + x])
						newMails = uniqueMail;
					}

					this.previousYandexEmailLength += newMails.length;
					
					//Clean emails)
					newMails = this.cleanEmails(newMails)
					//Store
					if(newMails) this.emails = [...this.emails, ...newMails];
					//Check is the target is met
					emailTarget = this.emailTarget();
					if(emailTarget.isMet) return resolve(this.emails)
					//Check if the next button still exist on the page
					this.isYandexEnd = await this.yandexPage.evaluate(() => {
						return document.querySelector(this.yandexNextSelector) ? false : true
					})

				}


				if(this.isGoogleEnd && this.isBindEnd && this.isYandexEnd && this.isDuckDuckGoEnd && this.isYahooEnd) resolve(this.emails)
				else {
					return resolve(this.emails)
					// console.log("I am iterating now")
					// await (() => new Promise((resolve) => setTimeout(() => resolve(), 5000)))();
					// let result = await this.getEmail(query, limit)
					// return resolve(result)
				}

			}catch(err){
				console.log(err)

			}	
		})
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
}


module.exports = ExtractorEngine;


