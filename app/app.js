// BASE APPLICATION LOGIC

// DEPENDENCIES
const fastify = require("fastify")({logger: true});
const {homeRouter, } = require("../router/index");
const serveStatic = require("serve-static");
const viewer = require("point-of-view");
const ejs = require("ejs");
const path = require("path");
const middie = require("middie");
const responseCompression = require("compression");
const getStatic = require("fastify-static");

// REGISTER TEMPLATE ENGINE
fastify.register(viewer, { engine: { ejs } });

// REGISTER ROUTERS
fastify.register(homeRouter); //Home route

// SERVE STATIC FILES
fastify.register(getStatic, {root: path.join(__dirname, "../public"), prefix: "/public/"})

// BOOTSTRAP SERVER
module.exports = {
	bootstrap: async (next) => {
		try{
			await fastify.register(middie)
			// REGISTER MIDDLEWARES
			fastify.use(responseCompression());
			await next()
		}catch(err){
			fastify.log.error(err);
		}
	},
	fastify
}
