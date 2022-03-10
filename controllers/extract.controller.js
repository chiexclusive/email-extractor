	//@name - Method
// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {database} = require("./../storage");




class Extract {

	//@name - Method
	//@description - Handle validation
	validateExtrationPreferences(req, reply, done){
		const {domain, profession, email, limit} = req.body;
		console.log(database)
		
		if(!domain) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "domain"})
		if(!profession) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "profession"})
		if(!email) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "email"})
		if(!limit) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "limit"})

		//Validate trial based on a day
		const date = new Date()
		let today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
		if(database.today === today && database.trialsLeft > 3) return reply.code(400).type("application/json").send({status: false, message: "Trial exceeded"})
		if(database.today === today && (+database.genNum + (+limit))  > 500) return reply.code(400).type("application/json").send({status: false, message: `You have ${500 - database.genNum} number of email left`})

		done();
	}


	//@name - Method
	//@description - Process Access Request
	handleExtraction(req, reply){
		const date = new Date()
		const today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();

		if(database.today !== today){
			database.genNum = 0
			database.trialsLeft = 3
			database.today = today;
		}
		
		const emails = ["test@gmail.com", "google@gmail.com"];

		const fileName = `emails_${emails.length}`;

		//Update DB
		database.emails[fileName] = emails;
		database.trialsLeft -= 1
		database.genNum += emails.length

		reply.code(200).type("application/json").send(
			JSON.stringify({
				status: true,
				message: "Emails successfully extracted",
				file: fileName
			})
		)
	}


}

module.exports = new Extract();