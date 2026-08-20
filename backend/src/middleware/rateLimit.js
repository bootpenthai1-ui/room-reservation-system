const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่อีกครั้งใน 15 นาที" },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "สมัครสมาชิกบ่อยเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
});

module.exports = { loginLimiter, registerLimiter };
