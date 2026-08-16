const express = require("express");
const { listUsers, getUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin"), listUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
