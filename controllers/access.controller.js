// ACCESS CONTROLLERS

// Dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


class Access {

	//@name - Method
	//@description - Check Auth
	auth(token){
		if(!token) return false;
		token = token.split(".")
		token = token[0] + "." + token[1] + "." + token[2]
		const decoded = jwt.verify(token, process.env.TOKEN_SERCET);
		if(decoded && decoded.isAuthorized) return true
		return false;
	}



	//@name - Method
	//@description - Process Access Request
	processAccess(req, reply){
		const {access_id, access_key} = req.body
		
		//Run Validation
		if(access_id.toString().trim() === "" ) reply.view("/../views/ejs/components/landing", {status: false, message: "Access ID or Access keys cannot be left empty", data: req.body})
		if(process.env.ACCESS_ID !== access_id) reply.view("/../views/ejs/components/landing", {status: false, message: "Incorrect Access ID or Access Keys", data: req.body})
		bcrypt.compare(access_key, process.env.ACCESS_KEY, async (err, result) => {
			if(err) reply.view("/../views/ejs/components/landing", {status: false, message: "Incorrect Access ID or Access Keys", data: req.body})
			else{
				console.log("access was granted")
				const token = jwt.sign({isAuthorized: true}, process.env.TOKEN_SERCET)
				console.log(token)
				reply.setCookie("token", token, {
					path: "/",
					signed: true
				}).view("/../views/ejs/components/landing", {status: true, message: "Access Granted", data : {access_id: "", access_key: ""}})
			}
		})

	}


}

module.exports = new Access();