const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateMe);


// Perfil do usuário logado
router.get("/profile", authMiddleware, userController.getProfile);

// Atualizar perfil
router.put("/profile", authMiddleware, userController.updateProfile);

module.exports = router;