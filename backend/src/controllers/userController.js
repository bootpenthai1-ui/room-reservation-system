const User = require("../models/User");
const Student = require("../models/Student");

async function listUsers(req, res) {
  try {
    const { role, status, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).select("-password").sort({ created_at: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "โหลดรายชื่อผู้ใช้ไม่สำเร็จ", error: err.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    const student = await Student.findOne({ user_id: user._id });
    res.json({ user, student });
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลผู้ใช้ไม่สำเร็จ", error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const isSelf = req.params.id === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้นี้" });
    }

    const { full_name, phone, department, role, status } = req.body;
    const update = { full_name, phone, department };

    if (isAdmin) {
      if (role) update.role = role;
      if (status) update.status = status;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ", error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json({ message: "ระงับบัญชีผู้ใช้เรียบร้อยแล้ว", user });
  } catch (err) {
    res.status(500).json({ message: "ลบผู้ใช้ไม่สำเร็จ", error: err.message });
  }
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
