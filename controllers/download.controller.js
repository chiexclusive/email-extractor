// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {database} = require("../storage")


class Download {

	//@name - Method
	//@description - Download Text File of Emails
	processDownload(req, reply){
		reply.type("application/json").send(JSON.stringify(database.emails));
	}


}

module.exports = new Download();