const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  passwordReset,
  authenticateUser,
} = require("../controllers/authController");
const { isUserLoggedIn } = require("../middleware/middlewares");
const router = express.Router();

router.route("/v1/auth/register").post(registerUser);
router.route("/v1/auth/login").post(loginUser);
router.route("/v1/auth/logout").get(isUserLoggedIn, logoutUser);
router.route("/v1/auth/authenticate").get(isUserLoggedIn, authenticateUser);

// NOTE This API route will also work for forgot password with security question's answer
router.route("/v1/auth/password/reset").put(passwordReset);

module.exports = router;
