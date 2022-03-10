// DASHBOARD ROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index");

const dashboardRouter = (fastify, options, done) => {
	fastify.get("/dashboard", {
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
		handler: controller.index.sendDashboardPage
	})
	// Done Processing
	done();
}
module.exports = dashboardRouter;