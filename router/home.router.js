// HOME ROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index")

const homeRouter = (fastify, options, done) => {
	fastify.get("/", {
		schema: {
			response: {
				200: {
					type: "string",
				}
			}
		},
		preHandler: [index, ],
		handler: controller.index.sendLandingPage
		// handler: (req, reply) => {
		// 	fastify.log.info(req)
		// 	reply.send("sdsadsas")
		// }
	})
	// Done Processing
	done();
}
module.exports = homeRouter;