const express = require("express");
const membershipCodeController = require("../controllers/membershipCodeController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/validate/:code", membershipCodeController.validate);
router.get("/", authMiddleware, authorizeRoles("admin"), membershipCodeController.list);
router.post("/", authMiddleware, authorizeRoles("admin"), membershipCodeController.create);

module.exports = router;
