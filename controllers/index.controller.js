// INDEX CONTROLLERS

class Index {

	//@name - Method
	//@description - Send Landing page to client
	sendLandingPage(req, reply){
		reply.view("/../views/ejs/components/landing", {status: "", message: "",  data : {access_id: "", access_key: ""}});
	}


	//@name - Method
	//@description - Send Dashboard page to the client
	sendDashboardPage(req, reply){
		reply.view("/../views/ejs/components/dashboard");
	}
}

module.exports = new Index();