const express = require("express");
const {
  listBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} = require("../controllers/buildingController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.get("/", listBuildings);
router.post("/", protect, authorize("admin"), createBuilding);
router.put("/:id", protect, authorize("admin"), updateBuilding);
router.delete("/:id", protect, authorize("admin"), deleteBuilding);

module.exports = router;
