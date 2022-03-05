// INDEX CONTROLLERS

class Index {

	//@name - Method
	//@description - Send Landing page to client
	sendLandingPage(req, reply){
		reply.view("/../views/ejs/components/landing");
	}
}

module.exports = new Index();