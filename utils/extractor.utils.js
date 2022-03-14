const email = require('node-email-extractor').default;
let browser = require("./../app/browser");
let  googlePage, bingPage, yahooPage, duckDuckGoPage, chrome;
const History = require("./../schemas/history.schema.js")


class ExtractorEngine {

	constructor() {
		this.emails = [];
		this.limit = 10;
		this.start = 0;
		this.firstPage = true;
		const addBrowserDisconnectionEvent = this.browserDisconnectionHandler;
		return new Promise(async(resolve) =>{
			try{
				let utils = await browser();
				googlePage = utils.googlePage;
				bingPage = utils.bingPage;
				yahooPage = utils.yahooPage;
				duckDuckGoPage = utils.duckDuckGoPage;
				chrome = utils.chrome
				addBrowserDisconnectionEvent(chrome);
			}catch(err){
				console.log("====================EXTRACTION ENGINE======================")
				console.log(err)
			}
			
			resolve(this)
		});
	}


	browserDisconnectionHandler(browserInstance){
		browserInstance.on("disconnected", async () => {
			// Restart Browser
			try{
				browser = require("./../app/browser")();
				let utils = await browser;
				googlePage = utils.googlePage;
				bingPage = utils.bingPage;
				yahooPage = utils.yahooPage;
				duckDuckGoPage = utils.duckDuckGoPage;
				chrome = utils.chrome
				addBrowserDisconnectionEvent(chrome);
			}catch(err){
				console.log("====================EXTRACTION ENGINE======================")
				console.log(err);
			}
			
		})
	}


	getRandomIndex(num){
		return Math.floor((Math.random() * num))
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
			

				var html = "", newMails = [], emailTarget = 0, selector= "", paginatedUrl= "";

				//Start with google
				if(!this.isGoogleEnd){
					console.log("================GOOGLE EXTRATING...")
					try{
						await googlePage.bringToFront();
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
						try{
							await googlePage.close()
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
						googlePage = await chrome.newPage();

					}
					

					// VISIT PAGE TO SET NEXT SELECTOR
					if(!this.googleNextSelector){
						
						// GET PREVIOUS URL
						let url
						try{
							url = await History.findOne({query, domain: "google"}).select("url")
							console.log(url)
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}

						if(url){
							// URL FOUND => CONTINUE
							try{
								await googlePage.goto("https://google.com"+url.url, {waitUntil: "networkidle0", timeout: 1000000});
								paginatedUrl = await googlePage.evaluate(() => {
									if(document.querySelector("#pnnext")){
										let url = document.querySelector("#pnnext").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.findOneAndUpdate({query, domain: "google"}, {url:paginatedUrl})
								this.googleNextSelector =  "#pnnext";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
								try{
									await googlePage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
								googlePage = await chrome.newPage();
							}
							
						}else{
							// URL NOT FOUND => START AFRESH
							try{
								await googlePage.goto( `https://google.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
								// GET PAGINATED ROUTE
								paginatedUrl = await googlePage.evaluate(() => {
									if(document.querySelector("#pnnext")){
										let url = document.querySelector("#pnnext").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.create({query, domain: "google", url:paginatedUrl});
								this.googleNextSelector =  "#pnnext";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
								try{
									await googlePage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
								googlePage = await chrome.newPage();
							}
						}
					}else{
						//Click the next button
						try{
							await googlePage.click(this.googleNextSelector);
							await googlePage.waitForNavigation({waitUntil: "networkidle0", timeout: 1000000})
							paginatedUrl = await googlePage.evaluate(() => {
								if(document.querySelector("#pnnext")){
									let url = document.querySelector("#pnnext").getAttribute("href")
									return url
								}else return null
							})
							// SAVE PAGINATED URL (IF EXIST)
							if(paginatedUrl) await History.findOneAndUpdate({query, domain: "google"}, {url:paginatedUrl})
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
						
					}
					//Scrape
					try{
						html = await googlePage.evaluate(() => {
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
						console.log(newMails)
						//Store
						if(newMails) this.emails = [...this.emails, ...newMails];
						//Check is the target is met
						emailTarget = this.emailTarget();
						
						if(emailTarget.isMet) return resolve(this.emails)
						//Check if the next button still exist on the page
						this.isGoogleEnd = await googlePage.evaluate(() => {
							return document.querySelector("#pnnext") ? false : true
						})//When there is no next value
						this.isGoogleEnd = newMails.length > 0 ? false : true //When no email was matched on the page
						if(this.isGoogleEnd ) await History.findOneAndDelete({query, domain: "google"})
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
					}
				}



				//Start with bing
				if(!this.isBingEnd){
					try{
						console.log("================BING EXTRATING...")
						await bingPage.bringToFront();
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)

						try{
							await bingPage.close()
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
						bingPage = await chrome.newPage();
					}

					// VISIT PAGE TO SET NEXT SELECTOR
					if(!this.bingNextSelector){

						// GET PREVIOUS URL
						let url
						try{
							await History.findOne({query, domain: "bing"}).select("url")
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}

						if(url){
							// URL FOUND => CONTINUE
							try{
								await bingPage.goto("https://bing.com"+url.url, {waitUntil: "networkidle0", timeout: 1000000});
								paginatedUrl = await bingPage.evaluate(() => {
									if(document.querySelector(".sb_pagN")){
										let url = document.querySelector(".sb_pagN").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.findOneAndUpdate({query, domain: "bing"}, {url:paginatedUrl})
								this.bingNextSelector =  ".sb_pagN";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
						
								try{
									await bingPage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
							
								bingPage = await chrome.newPage();
							}
						}else{
							// URL NOT FOUND => START AFRESH
							try{
								await bingPage.goto( `https://bing.com/search?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
								// GET PAGINATED ROUTE
								paginatedUrl = await bingPage.evaluate(() => {
									if(document.querySelector(".sb_pagN")){
										let url = document.querySelector(".sb_pagN").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.create({query, domain: "bing", url:paginatedUrl});
								this.bingNextSelector =  ".sb_pagN";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
							
								try{
									await bingPage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
								bingPage = await chrome.newPage();
							}
						}
						
					}else{
						//Click the next button
						try{
							await bingPage.click(this.bingNextSelector);
							await bingPage.waitForSelector(".sb_pagN")
							paginatedUrl = await bingPage.evaluate(() => {
								if(document.querySelector(".sb_pagN")){
									let url = document.querySelector(".sb_pagN").getAttribute("href")
									return url
								}else return null
							})
							// SAVE PAGINATED URL (IF EXIST)
							if(paginatedUrl) await History.findOneAndUpdate({query, domain: "bing"}, {url:paginatedUrl})
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
					}
					//Scrape
					try{
						html = await bingPage.evaluate(() => {
							return document.querySelector("body").innerHTML;
						})

						html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
						html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ").replaceAll("[", " ").replaceAll("]", " ");
						html = html.toString();

						//Get emails
						newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g) || []
						//Clean emails
						newMails = this.cleanEmails(newMails)
						console.log(newMails)
						//Store
						if(newMails) this.emails = [...this.emails, ...newMails];
						//Check is the target is met
						emailTarget = this.emailTarget();
						if(emailTarget.isMet) return resolve(this.emails)
						//Check if the next button still exist on the page
						this.isBingEnd = await bingPage.evaluate(() => {
							return document.querySelector(".sb_pagN") ? false : true
						})//When there is no next value
						this.isBindEnd = newMails.length > 0 ? false : true //When no email was matched on the page
						if(this.isBingEnd) await History.findOneAndDelete({query, domain: "bing"})
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
					}
				}





				//Start with yahoo
				if(!this.isYahooEnd){
					try{
						console.log("================YAHOO EXTRATING...")
						await yahooPage.bringToFront();
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)

						try{
							await yahooPage.close()
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
						yahooPage = await chrome.newPage();
					}

					// VISIT PAGE TO SET NEXT SELECTOR
					if(!this.yahooNextSelector){

						// GET PREVIOUS URL
						let url
						try{
							url = await History.findOne({query, domain: "yahoo"}).select("url")
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}

						if(url){
							// URL FOUND => CONTINUE
							try{
								await yahooPage.goto(url.url, {waitUntil: "networkidle0", timeout: 1000000});
								paginatedUrl = await yahooPage.evaluate(() => {
									if(document.querySelector(".next")){
										let url = document.querySelector(".next").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.findOneAndUpdate({query, domain: "yahoo"}, {url:paginatedUrl})
								this.yahooNextSelector =  ".next";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
							
								try{
									await yahooPage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
								yahooPage = await chrome.newPage();
							}
						}else{
							// URL NOT FOUND => START AFRESH
							try{
								await yahooPage.goto( `https://search.yahoo.com/search?p=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
								paginatedUrl = await yahooPage.evaluate(() => {
									if(document.querySelector(".next")){
										let url = document.querySelector(".next").getAttribute("href")
										return url
									}else return null
								})
								// SAVE PAGINATED URL (IF EXIST)
								if(paginatedUrl) await History.create({query, domain: "yahoo", url:paginatedUrl});
								this.yahooNextSelector =  ".next";
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
							
								try{
									await yahooPage.close()
								}catch(err){
									console.log("====================EXTRACTION ENGINE======================")
									console.log(err)
								}
								yahooPage = await chrome.newPage();
							}
						}
						
					}else{
						//Click the next button
						try{
							await yahooPage.click(this.yahooNextSelector);
							await yahooPage.waitForSelector(".next");
							paginatedUrl = await yahooPage.evaluate(() => {
								if(document.querySelector(".next")){
									let url = document.querySelector(".next").getAttribute("href")
									return url
								}else return null
							})
							// SAVE PAGINATED URL (IF EXIST)
							if(paginatedUrl) await History.findOneAndUpdate({query, domain: "yahoo"}, {url:paginatedUrl})
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
					}


					try{
						//Scrape
						html = await yahooPage.evaluate(() => {
							return document.querySelector("body").innerHTML;
						})

						html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
						html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ");
						html = html.toString();
					
						//Get emails
						newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g) || []
						//Clean emails
						newMails = this.cleanEmails(newMails)
						console.log(newMails)
						//Store
						if(newMails) this.emails = [...this.emails, ...newMails];
						//Check is the target is met
						emailTarget = this.emailTarget();
						if(emailTarget.isMet) return resolve(this.emails)
						//Check if the next button still exist on the page
						this.isYahooEnd = await yahooPage.evaluate(() => {
							return document.querySelector(".next") ? false : true
						})//When there is no next value
						this.isYahooEnd = newMails.length > 0 ? false : true //When no email was matched on the page
						if(this.isYahooEnd) await History.findOneAndDelete({query, domain: "yahoo"})
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
					}
				}



				//Start with duck duck
				if(!this.isDuckDuckGoEnd){
					try{
						console.log("================DUCKDUCK GO EXTRATING...")
						await duckDuckGoPage.bringToFront();
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
					
						try{
							await duckDuckGoPage.close()
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
						duckDuckGoPage = await chrome.newPage();
					}

					if(!this.duckDuckGoNextSelector){
						//Go to duckDuckGo with search query
						try{
							await duckDuckGoPage.goto( `https://duckduckgo.com?q=${query}`, {waitUntil: "networkidle0", timeout: 1000000});
							this.duckDuckGoNextSelector =  ".result--more";
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						
							try{
								await duckDuckGoPage.close()
							}catch(err){
								console.log("====================EXTRACTION ENGINE======================")
								console.log(err)
							}
							duckDuckGoPage = await chrome.newPage();
						}
					}else{
						//Click the next button
						try{
							await Promise.all([
								duckDuckGoPage.evaluate(() => {
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
								duckDuckGoPage.click(this.duckDuckGoNextSelector)
							]);
						}catch(err){
							console.log("====================EXTRACTION ENGINE======================")
							console.log(err)
						}
					}
					//Scrape
					try{
						html = await duckDuckGoPage.evaluate(() => {
						return document.querySelector("body").innerHTML;
						})

						html = html.replace(/<\/*b?>/ig, "").replace(/<\/*strong?>/ig, "");
						html = html.replace(/<\/*.+?>/ig, " ").replace(/\"/ig, " ").replace(/\'/ig, " ").replaceAll("(", " ").replaceAll(")", " ").replaceAll("[", " ").replaceAll("]", " ");
						html = html.toString();

						//Get emails
						newMails = html.match(/\S+@{1,1}\S+?\.{1,1}com{1,1}?/g) || []
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
						console.log(newMails)
						//Store
						if(newMails) this.emails = [...this.emails, ...newMails];
						//Check is the target is met
						emailTarget = this.emailTarget();
						if(emailTarget.isMet) return resolve(this.emails)
						//Check if the next button still exist on the page
						this.isDuckDuckGoEnd = await duckDuckGoPage.evaluate(() => {
							return document.querySelector(".result--more") ? false : true
						})//When there is no next value
						this.isDuckDuckGoEnd = newMails.length > 0 ? false : true //When no email was matched on the page
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
					}
				}



				if(this.isGoogleEnd && this.isBindEnd && this.isYandexEnd && this.isDuckDuckGoEnd && this.isYahooEnd) resolve(this.emails)
				else {
					// return resolve(this.emails)
					console.log(this.emails)
					console.log("============I am iterating now=============")
					try{
						await (() => new Promise((resolve) => setTimeout(() => resolve(), 3000)))();
						let result = await this.getEmail(query, limit)
						return resolve(result)
					}catch(err){
						console.log("====================EXTRACTION ENGINE======================")
						console.log(err)
						return resolve(this.emails)
					}
					
				}

			}catch(err){
				console.log("====================EXTRACTION ENGINE======================")
				console.log(err)
				return resolve(this.emails);
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
}


module.exports = ExtractorEngine;

