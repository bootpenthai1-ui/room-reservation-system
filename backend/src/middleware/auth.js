const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "บัญชีผู้ใช้ไม่ถูกต้องหรือถูกระงับ" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

module.exports = { protect };
