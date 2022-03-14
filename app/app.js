// BASE APPLICATION LOGIC

// DEPENDENCIES
const fastify = require("fastify")({logger: true});
const {homeRouter, accessRouter, dashboardRouter, downloadRouter, extractRouter} = require("../router/index");
const serveStatic = require("serve-static");
const viewer = require("point-of-view");
const ejs = require("ejs");
const path = require("path");
const middie = require("middie");
const responseCompression = require("compression");
const getStatic = require("fastify-static");
const fastifyCookie = require("fastify-cookie");
const fastifySimpleForm = require("fastify-simple-form")
const environment = require("dotenv")
const bootstrapDatabase = require("./../conns/mongo.conn.js")
const httpTimeout = require('fastify-server-timeout')






// USE ENVIRONMENT FROM FILE
environment.config();

// REGISTER TEMPLATE ENGINE
fastify.register(viewer, { engine: { ejs } });

// REGSITER GENERAL PLUGINS
fastify.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
})
fastify.register(fastifySimpleForm, {
	urlencoded: true,
	multipart: true
})
fastify.register(httpTimeout, {
  serverTimeout: 60000 //ms
})


// REGISTER ROUTERS
fastify.register(homeRouter); //Home route
fastify.register(accessRouter); //Acess route
fastify.register(dashboardRouter); //Dashboard route
fastify.register(downloadRouter); //Download route
fastify.register(extractRouter); // Extraction route

// SERVE STATIC FILES
fastify.register(getStatic, {root: path.join(__dirname, "../public"), prefix: "/public/"})

// BOOTSTRAP SERVER
module.exports = {
	bootstrap: async (next) => {
		try{
			await fastify.register(middie)
			// REGISTER MIDDLEWARES
			fastify.use(responseCompression());
			// START DB
			bootstrapDatabase();
			await next()
		}catch(err){
			fastify.log.error(err);
		}
	},
	fastify
}
