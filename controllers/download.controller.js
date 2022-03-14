// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Stat = require("./../schemas/stat.schema.js")


class Download {

	//@name - Method
	//@description - Download Text File of Emails
	async processDownload(req, reply){
		const today = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
		try{
			const stat = await Stat.findOne({day: today});
			const emails = stat ? stat.emails : []
			reply.type("application/json").send(JSON.stringify(emails));
		}catch(err){
			console.log("==============DOWNLOAD CONTROLLER============")
			console.log(err)
			reply.code(500)
		}
		
		
	}


}

module.exports = new Download();