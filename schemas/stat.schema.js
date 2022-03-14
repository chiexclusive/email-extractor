const mongoose = require('mongoose');


const StatSchema = new mongoose.Schema({
	date: {type: String, default: null},
    genNum: {type: Number, default: null},
    emails: [{type: String}]
}, { timestamps: true })


const Stat = mongoose.model('Stat',StatSchema);

module.exports = Stat;