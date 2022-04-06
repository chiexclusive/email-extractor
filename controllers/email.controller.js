// INDEX CONTROLLERS
const axios = require("axios");

class Email {

	//@name - Method
	//@description - Send Landing page to client
	sendBulkEmailPage(req, reply){
		reply.view("/../views/ejs/components/email");
	}


	//@name - Method
	//@description - Send Landing page to client
	async sendBulkEmail(req, reply){
		const {emails} = req.body;
		try{
			console.log(process.env.SMTP_SERVER)
			await axios.post(process.env.SMTP_SERVER, {emails, accessKey: process.env.AUTH_KEY})
			.then(res => {	
				return reply.code(res.data.code).type("application/json").send(JSON.stringify({status: res.data.status, message: res.data.message}))
			})
			.catch(err => {
				return reply.code(err.response.data.code).type("application/json").send(JSON.stringify(err.response.data))
			})
		}catch(err){
			console.log(err)
			return reply.code(500).type("application/json").send(JSON.stringify({status: false, message: "Unidentified Error"}))
		}
	}
}

module.exports = new Email();