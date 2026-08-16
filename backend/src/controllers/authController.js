const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function register(req, res) {
  try {
    const { full_name, email, password, phone, role, department, student_id, major, faculty, academic_year } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกชื่อ, อีเมล และรหัสผ่านให้ครบถ้วน" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    const allowedSelfRoles = ["student", "staff", "external"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "student";

    const user = await User.create({
      full_name,
      email,
      password,
      phone,
      role: finalRole,
      department,
    });

    if (finalRole === "student" && student_id) {
      await Student.create({
        student_id,
        user_id: user._id,
        major,
        faculty,
        academic_year,
      });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน" });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", error: err.message });
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

module.exports = { register, login, me };
