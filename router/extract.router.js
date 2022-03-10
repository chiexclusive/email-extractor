
// EXTRACTROUTER

// DEPENDENCIES
const {index} = require("../middlewares/index");
const controller = require("../controllers/index")

const extractRouter = (fastify, options, done) => {
	fastify.post("/extract", {
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						file: {
							type: "string"
						}
					}
				},
				400:{
					type: "object",
					properties: {
						status: {
							type: "boolean"
						},
						message: {
							type: "string"
						},
						field: {
							type: "string"
						}
					}
				}
			}
		},
		preHandler: [
			(req, reply, done) => {
				if(controller.access.auth(req.cookies.token)) done()
				else reply.code(401).type("application/json").send(JSON.stringify({status: false, message: "Unauthorized, Reload page to continue."}))
			},
			controller.extract.validateExtrationPreferences
		],
		handler: controller.extract.handleExtraction
	})
	// Done Processing
	done();
}
module.exports = extractRouter;