// INDEX MIDDLE WARES (ALL FUNCTION REGISTERED HERE RUN FOR ALL ROUTES)

// DEPENDENCIES
const { trim }= require("../utils/helper.utils")
module.exports = (_req, _res, _next) => {
	
	//Trim Request Body
	_req.body = trim(_req.body)

	_next();
}