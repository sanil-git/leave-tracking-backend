const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Holiday', holidaySchema); 