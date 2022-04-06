// FETCH ALL ROUTER FROM ROUTER OUTLET FILES
const homeRouter = require("./home.router.js");
const accessRouter = require("./access.router.js")
const dashboardRouter = require("./dashboard.router.js")
const downloadRouter = require("./download.router.js")
const extractRouter = require("./extract.router.js")
const bulkMailRouter = require("./bulkMail.router.js")
module.exports = {homeRouter, accessRouter, dashboardRouter, downloadRouter, extractRouter, bulkMailRouter}