	//@name - Method
// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {database} = require("./../storage");
const ExtractorEngine = require("./../utils/extractor.utils")




class Extract {

	//@name - Method
	//@description - Handle validation
	validateExtrationPreferences(req, reply, done){
		const {domain, keyword, email, limit} = req.body;
		console.log(database)
		
		if(!domain) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "domain"})
		if(!keyword) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "profession"})
		if(!email) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "email"})
		if(!limit) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "limit"})

		//Validate trial based on a day
		// const date = new Date()
		// let today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
		// if(database.today === today && database.trialsLeft > 3) return reply.code(400).type("application/json").send({status: false, message: "Trial exceeded"})
		// if(database.today === today && (+database.genNum + (+limit))  > 500) return reply.code(400).type("application/json").send({status: false, message: `You have ${500 - database.genNum} number of email left`})

		done();
	}


	//@name - Method
	//@description - Process Access Request
	handleExtraction(req, reply){
		const date = new Date()
		const today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
		let emails = [];
		let fileName

		if(database.today !== today){
			database.genNum = 0
			database.trialsLeft = 3
			database.today = today;
		}
		

		let {domain, keyword, email, limit} = req.body;

		//Cleanup data
		domain = domain.replace(/\..+$/ig, "").replace(/^.+:\/\/.*\./ig, "").replace(/^.+:\/\//ig, "")
		domain = "site:"+domain+".com";
		keyword = "\""+keyword+"\"+";
		email = /\@/.test(email)? email.match(/@.+$/g) || "@gmail.com" : email
		email = Array.isArray(email) ? email[0] : email
		email = /\.com$/.test(email) ? email : email + ".com"
		email = /^\@/.test(email) ? email : "@"+email
		limit = parseInt(limit) || 10;

		const extraction = new ExtractorEngine()

		extraction
		.then(async(instance) => {
			const query = `${domain} ${keyword} ${email} `			
			await instance.startChrome()
			emails = await instance.getEmail(query, limit)
			fileName = `emails_${emails.length}`;

			//Update DB
			database.emails = emails;
			database.trialsLeft -= 1
			database.genNum += emails.length


			reply.code(200).type("application/json").send(
				JSON.stringify({
					status: true,
					message: "Emails successfully extracted",
					file: fileName
				})
			)

			
		})
		.catch((err) => {
			reply.code(500).type("application/json").send({status: false, message: err.message})
			console.log(err)
		})
	}


}

module.exports = new Extract();