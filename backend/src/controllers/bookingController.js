const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

async function hasConflict({ room_id, booking_date, start_time, end_time, excludeId }) {
  const start = new Date(booking_date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(booking_date);
  end.setHours(23, 59, 59, 999);

  const query = {
    room_id,
    booking_date: { $gte: start, $lte: end },
    status: { $in: ["pending", "approved"] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Booking.find(query).select("start_time end_time");

  const newStart = timeToMinutes(start_time);
  const newEnd = timeToMinutes(end_time);

  return existing.some((b) => {
    const bStart = timeToMinutes(b.start_time);
    const bEnd = timeToMinutes(b.end_time);
    return newStart < bEnd && bStart < newEnd;
  });
}

async function createBooking(req, res) {
  try {
    const { room_id, booking_date, start_time, end_time, purpose } = req.body;

    if (!room_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลการจองให้ครบถ้วน" });
    }
    if (timeToMinutes(start_time) >= timeToMinutes(end_time)) {
      return res.status(400).json({ message: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด" });
    }

    const room = await Room.findById(room_id);
    if (!room || room.status !== "available") {
      return res.status(400).json({ message: "ห้องนี้ไม่พร้อมให้บริการ" });
    }

    const conflict = await hasConflict({ room_id, booking_date, start_time, end_time });
    if (conflict) {
      return res.status(409).json({ message: "ช่วงเวลานี้มีการจองห้องนี้ไปแล้ว" });
    }

    let documentFileUrl;
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file, "room-reservation/documents");
      documentFileUrl = uploaded.secure_url;
    }

    const booking = await Booking.create({
      user_id: req.user._id,
      room_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      document_file: documentFileUrl,
    });

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: "สร้างการจองไม่สำเร็จ", error: err.message });
  }
}

async function listBookings(req, res) {
  try {
    const { status, room_id, mine } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (room_id) filter.room_id = room_id;
    if (mine === "true" || req.user.role === "student" || req.user.role === "staff" || req.user.role === "external") {
      filter.user_id = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate("room_id", "room_name room_type")
      .populate("user_id", "full_name email role")
      .sort({ created_at: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "โหลดรายการจองไม่สำเร็จ", error: err.message });
  }
}

async function getBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room_id")
      .populate("user_id", "full_name email role department")
      .populate("approved_by", "full_name");
    if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

    const isOwner = booking.user_id._id.toString() === req.user._id.toString();
    const isStaff = ["room_staff", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ดูรายการจองนี้" });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลการจองไม่สำเร็จ", error: err.message });
  }
}

async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

    const isOwner = booking.user_id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ยกเลิกการจองนี้" });
    }
    if (["cancelled", "rejected", "completed"].includes(booking.status)) {
      return res.status(400).json({ message: "ไม่สามารถยกเลิกการจองนี้ได้" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "ยกเลิกการจองเรียบร้อยแล้ว", booking });
  } catch (err) {
    res.status(500).json({ message: "ยกเลิกการจองไม่สำเร็จ", error: err.message });
  }
}

async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "การจองนี้ถูกดำเนินการไปแล้ว" });
    }

    if (status === "approved") {
      const conflict = await hasConflict({
        room_id: booking.room_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        excludeId: booking._id,
      });
      if (conflict) {
        return res.status(409).json({ message: "มีการอนุมัติการจองที่ทับซ้อนกันไปแล้ว" });
      }
    }

    booking.status = status;
    booking.approved_by = req.user._id;
    booking.approved_at = new Date();
    await booking.save();

    res.json({ message: "อัปเดตสถานะการจองเรียบร้อยแล้ว", booking });
  } catch (err) {
    res.status(500).json({ message: "อัปเดตสถานะการจองไม่สำเร็จ", error: err.message });
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
};
