// CONTROLLER BASE

// DEPENDENCIES
const index = require("./index.controller.js")
const access = require("./access.controller.js")
const download = require("./download.controller.js")
const extract = require("./extract.controller.js")
module.exports = {
	index,
	access,
	download,
	extract
}