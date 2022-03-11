// APPLICATION ENTRY POINT

// DEPENDENCIES
const server = require("./app");
const PORT = process.env.PORT || 8080;

// HANDLE SERVER INITIALIZATION
server.bootstrap(async () => server.fastify.listen(PORT))


