const express = require("express");
const { createPayment, listPayments, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.post("/", upload.single("payment_proof"), createPayment);
router.get("/", listPayments);
router.patch("/:id/verify", authorize("room_staff", "admin"), verifyPayment);

module.exports = router;
