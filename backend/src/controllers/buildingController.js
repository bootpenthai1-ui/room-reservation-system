const Building = require("../models/Building");
const Room = require("../models/Room");

async function listBuildings(req, res) {
  try {
    const buildings = await Building.find().sort({ building_name: 1 });
    res.json({ buildings });
  } catch (err) {
    res.status(500).json({ message: "โหลดรายชื่ออาคารไม่สำเร็จ", error: err.message });
  }
}

async function createBuilding(req, res) {
  try {
    const { building_name, location, description } = req.body;
    if (!building_name) {
      return res.status(400).json({ message: "กรุณาระบุชื่ออาคาร" });
    }
    const building = await Building.create({ building_name, location, description });
    res.status(201).json({ building });
  } catch (err) {
    res.status(500).json({ message: "เพิ่มอาคารไม่สำเร็จ", error: err.message });
  }
}

async function updateBuilding(req, res) {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!building) return res.status(404).json({ message: "ไม่พบอาคาร" });
    res.json({ building });
  } catch (err) {
    res.status(500).json({ message: "แก้ไขอาคารไม่สำเร็จ", error: err.message });
  }
}

async function deleteBuilding(req, res) {
  try {
    const roomCount = await Room.countDocuments({ building_id: req.params.id });
    if (roomCount > 0) {
      return res.status(400).json({ message: "ไม่สามารถลบอาคารที่ยังมีห้องอยู่ได้" });
    }
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) return res.status(404).json({ message: "ไม่พบอาคาร" });
    res.json({ message: "ลบอาคารเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "ลบอาคารไม่สำเร็จ", error: err.message });
  }
}

module.exports = { listBuildings, createBuilding, updateBuilding, deleteBuilding };
