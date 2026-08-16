const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  booking_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  purpose: { type: String, trim: true },
  document_file: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled", "completed"],
    default: "pending",
  },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approved_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

bookingSchema.index({ room_id: 1, booking_date: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
