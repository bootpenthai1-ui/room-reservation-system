const express = require("express");
const {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.post("/", upload.single("document_file"), createBooking);
router.get("/", listBookings);
router.get("/:id", getBooking);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/status", authorize("room_staff", "admin"), updateBookingStatus);

module.exports = router;
