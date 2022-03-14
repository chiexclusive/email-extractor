// START CONNECTION TO THE DATABASE

// DEPENDENCIES
const mongoose = require("mongoose");
require("dotenv").config()


let hasTriedConnection = false
const bootstrapDatabase = async (url) => {
	console.log(hasTriedConnection? "Retrying connection to Mongodb": "Initializing connection to Mongodb")

	try{
		hasTriedConnection = true
		const uri = process.env.NODE_ENV == "development"?process.env.MONGODB_URI:process.env.MONGODB_PROD_URI
		console.log(uri)
		await mongoose.connect(uri)
		console.log("Connected to mongodb")
	}catch(err){
		console.log(err)
		await new Promise((resolve) => setTimeout(() => resolve(), 10000))
		return bootstrapDatabase(url)
	}

}

module.exports = bootstrapDatabase;
