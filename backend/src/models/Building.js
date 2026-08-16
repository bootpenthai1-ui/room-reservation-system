const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema({
  building_name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  description: { type: String, trim: true },
});

module.exports = mongoose.model("Building", buildingSchema);
