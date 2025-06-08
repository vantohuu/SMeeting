const express = require("express");
const router = express.Router();
const userController = require("../../controller/userController");
const { isAuth } = require("../../middleware/auth.middlewares");

router.post("/login", userController.loginUser);
router.post("/register", userController.registerUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/update-infor", isAuth, userController.updateInfor);

module.exports = router;
