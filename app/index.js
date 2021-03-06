// APPLICATION ENTRY POINT

// DEPENDENCIES
const server = require("./app");
const PORT = process.env.PORT || 8080;
const HOST = process.env.NODE_ENV !== "development" ? "0.0.0.0" : "127.0.0.1"

// HANDLE SERVER INITIALIZATION
server.bootstrap(async () => server.fastify.listen(PORT, HOST))


 