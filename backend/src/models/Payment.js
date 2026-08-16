const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, trim: true },
  payment_proof: { type: String },
  payment_status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Payment", paymentSchema);
