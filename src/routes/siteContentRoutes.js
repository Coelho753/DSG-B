const express = require("express");
const siteContentController = require("../controllers/siteContentController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", siteContentController.list);
router.put("/:id", authMiddleware, authorizeRoles("admin"), siteContentController.update);

module.exports = router;
