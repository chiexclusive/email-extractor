// ACCESS ROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index")

const accessRouter = (fastify, options, done) => {
	fastify.post("/request_access", {
		schema: {
			response: {
				200: {
					type: "string",
				}
			}
		},
		handler: controller.access.processAccess
	})
	// Done Processing
	done();
}
module.exports = accessRouter;