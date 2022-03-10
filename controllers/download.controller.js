// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


class Download {

	//@name - Method
	//@description - Check Auth



	//@name - Method
	//@description - Process Access Request
	processDownload(req, reply){
		// const {fileName} = req.body;
		reply.type("application/json").send(JSON.stringify(["chiboy@gmail.com", "isaac@gmail.com"]));
	}


}

module.exports = new Download();