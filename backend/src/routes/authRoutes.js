const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, me);

module.exports = router;
