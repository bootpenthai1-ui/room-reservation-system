const express = require("express");
const {
  listRooms,
  getRoom,
  getRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.get("/", listRooms);
router.get("/:id", getRoom);
router.get("/:id/availability", getRoomAvailability);
router.post("/", protect, authorize("admin"), createRoom);
router.put("/:id", protect, authorize("admin"), updateRoom);
router.delete("/:id", protect, authorize("admin"), deleteRoom);

module.exports = router;
