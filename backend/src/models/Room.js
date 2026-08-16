const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  building_id: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
  room_name: { type: String, required: true, trim: true },
  room_type: { type: String, trim: true },
  capacity: { type: Number, default: 0 },
  description: { type: String, trim: true },
  status: { type: String, enum: ["available", "unavailable"], default: "available" },
});

module.exports = mongoose.model("Room", roomSchema);
