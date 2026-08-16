const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

async function createPayment(req, res) {
  try {
    const { booking_id, amount, payment_method } = req.body;
    if (!booking_id || !amount) {
      return res.status(400).json({ message: "กรุณาระบุการจองและจำนวนเงิน" });
    }

    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ชำระเงินสำหรับการจองนี้" });
    }

    const payment = await Payment.create({
      booking_id,
      amount,
      payment_method,
      payment_proof: req.file ? req.file.filename : undefined,
    });

    res.status(201).json({ payment });
  } catch (err) {
    res.status(500).json({ message: "บันทึกการชำระเงินไม่สำเร็จ", error: err.message });
  }
}

async function listPayments(req, res) {
  try {
    const { payment_status } = req.query;
    const filter = {};
    if (payment_status) filter.payment_status = payment_status;

    const isStaff = ["room_staff", "admin"].includes(req.user.role);
    if (!isStaff) {
      const ownBookings = await Booking.find({ user_id: req.user._id }).select("_id");
      filter.booking_id = { $in: ownBookings.map((b) => b._id) };
    }

    const payments = await Payment.find(filter)
      .populate({
        path: "booking_id",
        populate: [
          { path: "room_id", select: "room_name" },
          { path: "user_id", select: "full_name email" },
        ],
      })
      .sort({ _id: -1 });

    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: "โหลดรายการชำระเงินไม่สำเร็จ", error: err.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const { payment_status } = req.body;
    if (!["verified", "rejected"].includes(payment_status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { payment_status, verified_by: req.user._id },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "ไม่พบรายการชำระเงิน" });

    res.json({ message: "อัปเดตสถานะการชำระเงินเรียบร้อยแล้ว", payment });
  } catch (err) {
    res.status(500).json({ message: "อัปเดตสถานะการชำระเงินไม่สำเร็จ", error: err.message });
  }
}

module.exports = { createPayment, listPayments, verifyPayment };
