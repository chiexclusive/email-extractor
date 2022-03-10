// DOWNLOAD ROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index")

const dashboardRouter = (fastify, options, done) => {
	fastify.post("/download", {
		schema: {
			response: {
				200: {
					type: "string",
				}
			}
		},
		preHandler: (req, reply, done) => {
			if(controller.access.auth(req.cookies.token)) done()
			else reply.code(401).send("UNAUTHORIZED")
		},
		handler: controller.download.processDownload
	})
	// Done Processing
	done();
}
module.exports = dashboardRouter;