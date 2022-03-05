// HELPER UTILITIES

// DEPENDENCIES
const trim = require("trimmer");

module.exports = {
	//@name - Function
	//@description - Trim white spaces from 
	//@param - payload (Array | Object | String)
	//@return - trimmed payload (Array | Object | String)
	trim: (payload) => {
		if(payload === null || payload === undefined) return null;

		let result;

		// Handle Array
		if(Array.isArray(payload)){
			result = [];
			payload.forEach((item, index) => {
				if(typeof item === "object") result.push(this.trim(item));
				else result.push(trim(item));
			})
			return result;
		}

		// Handle Object
		if(typeof payload === "object"){
			result = {};
			for(let index in payload){
				if(typeof payload[index] === "object") result[index] = this.trim(payload[index])
				else result[index] = trim(payload[index])
			}
		}

		// Handle Object
		return trim(payload)

	}
}