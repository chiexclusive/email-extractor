	//@name - Method
// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ExtractorEngine = require("./../utils/extractor.utils")
const Stat = require("./../schemas/stat.schema.js")
let hasBeenCalled =  false;
let num = 0

class Extract {

	//@name - Method
	//@description - Handle validation
	async validateExtrationPreferences(req, reply, done){
		const {domain, keyword, email, limit} = req.body;
		
		if(!domain) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "domain"})
		if(!keyword) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "profession"})
		if(!email) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "email"})
		if(!limit) return reply.code(400).type("application/json").send({status: false, message: "Empty Field", field: "limit"})
		if(parseInt(limit) > 100) return reply.code(400).type("application/json").send({status: false, message: "Limit per request cannot exceed 100", field: "limit"})

		//Validate trial based on a day
		const date = new Date()
		let today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();

		// GET STAT FOR TODAY
		try{
			const stat = await Stat.findOne({day: today});
			if(stat && ((+stat.genNum) + (+limit)) > 500) return reply.code(400).type("application/json").send({status: false, message: `You have ${500 - stat.genNum} number of emails left for today`})
		}catch(err){
			console.log("================EXTRACT CONTROLLER=============")
			console.log(err)
			return reply.code(500).type("application/json").send({status: false, message: "Unidentified error"})
		}
		
		done();
	}

	
	//@name - Method
	//@description - Process Access Request
	handleExtraction(req, reply){

		if(hasBeenCalled) return
		else hasBeenCalled = true;

		
		const date = new Date()
		const today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
		let emails = [];
		let fileName
		let {domain, keyword, email, limit} = req.body;

		//Cleanup data
		domain = domain.replace(/\..+$/ig, "").replace(/^.+:\/\/.*\./ig, "").replace(/^.+:\/\//ig, "")
		domain = "site:"+domain+".com";
		keyword = "\""+keyword+"\"";

		email = /\@/.test(email)? email.match(/@.+$/g) || "@gmail.com" : email
		email = Array.isArray(email) ? email[0] : email
		email = /\.com$/.test(email) ? email : email + ".com"
		email = /^\@/.test(email) ? email : "@"+email
		limit = parseInt(limit) || 10;

		const extraction = new ExtractorEngine()

		extraction
		.then(async(instance) => {
			const query = `${domain.trim()} ${keyword.trim()} ${email.trim()}`.toLowerCase()	

			emails = await instance.getEmail(query, limit)
			fileName = `emails_${emails.length}`;

			const stat = await Stat.findOne({day: today});
			console.log(stat)
			if(stat){
				stat.emails = emails
				stat.genNum += emails.length;
				await stat.save();
			}else{
				await Stat.create({day: today, emails, genNum: emails.length})
			}

			if(emails.length == 0) return reply.code(404).type("application/json").send({status: false, message: `No emails found`})
			else{
				reply.code(200).type("application/json").send(
					JSON.stringify({
						status: true,
						message: "Emails successfully extracted",
						file: fileName
					})
				)
			}
			

			// await instance.exitBrowser()
			hasBeenCalled = false;

			
		})
		.catch((err) => {
			console.log("=====================EXTRACT CONTROLLER====================")
			console.log(err)
			reply.code(500).type("application/json").send({status: false, message: "Unidentified error"})
		})
	}


}

module.exports = new Extract();