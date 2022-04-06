// ACCESS ROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index")

const bulkMailRouter = (fastify, options, done) => {
	fastify.get("/send_email", {
		schema: {
			response: {
				200: {
					type: "string",
				}
			}
		},
		preHandler: (req, reply, done) => {
			if(controller.access.auth(req.cookies.token)) done()
			else controller.index.sendLandingPage(req, reply)
		},
		handler: controller.email.sendBulkEmailPage
	})

	fastify.post("/send_email", {
		schema: {
			response: {
				200: {
					type: "string",
				}
			}
		},
		preHandler: (req, reply, done) => {
			if(controller.access.auth(req.cookies.token)) done()
			else return reply.code(401).type("application/json").send({status: false, message: "UnAuthorized"})
		},
		handler: controller.email.sendBulkEmail
	})
	// Done Processing
	done();
}
module.exports = bulkMailRouter;