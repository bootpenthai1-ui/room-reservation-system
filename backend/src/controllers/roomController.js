const Room = require("../models/Room");
const Booking = require("../models/Booking");

async function listRooms(req, res) {
  try {
    const { building_id, status, search } = req.query;
    const filter = {};
    if (building_id) filter.building_id = building_id;
    if (status) filter.status = status;
    if (search) filter.room_name = { $regex: search, $options: "i" };

    const rooms = await Room.find(filter).populate("building_id", "building_name location").sort({ room_name: 1 });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: "โหลดรายชื่อห้องไม่สำเร็จ", error: err.message });
  }
}

async function getRoom(req, res) {
  try {
    const room = await Room.findById(req.params.id).populate("building_id", "building_name location");
    if (!room) return res.status(404).json({ message: "ไม่พบห้อง" });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลห้องไม่สำเร็จ", error: err.message });
  }
}

async function getRoomAvailability(req, res) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "กรุณาระบุวันที่" });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      room_id: req.params.id,
      booking_date: { $gte: start, $lte: end },
      status: { $in: ["pending", "approved"] },
    }).select("start_time end_time status");

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "โหลดตารางเวลาไม่สำเร็จ", error: err.message });
  }
}

async function createRoom(req, res) {
  try {
    const { building_id, room_name, room_type, capacity, description, status } = req.body;
    if (!building_id || !room_name) {
      return res.status(400).json({ message: "กรุณาระบุอาคารและชื่อห้อง" });
    }
    const room = await Room.create({ building_id, room_name, room_type, capacity, description, status });
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: "เพิ่มห้องไม่สำเร็จ", error: err.message });
  }
}

async function updateRoom(req, res) {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "ไม่พบห้อง" });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: "แก้ไขห้องไม่สำเร็จ", error: err.message });
  }
}

async function deleteRoom(req, res) {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "ไม่พบห้อง" });
    res.json({ message: "ลบห้องเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "ลบห้องไม่สำเร็จ", error: err.message });
  }
}

module.exports = {
  listRooms,
  getRoom,
  getRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
