const mongoose = require('mongoose');


const HistorySchema = new mongoose.Schema({
	query: {type: String, default: null},
    domain: {type: String, default: null},
    url: {type: String, default: null},
}, { timestamps: true })


const History = mongoose.model('History',HistorySchema);

module.exports = History;