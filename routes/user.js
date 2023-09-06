const express = require("express");
const {
  updateUser,
  deactivateUser,
  deleteUser,
  getUser,
  getAllUsers,
} = require("../controllers/userController");
const { isUserLoggedIn } = require("../middleware/middlewares");
const router = express.Router();

router.route("/v1/user").get(isUserLoggedIn, getUser);
router.route("/v1/users").get(isUserLoggedIn, getAllUsers);
router.route("/v1/user/update").put(isUserLoggedIn, updateUser);

// Danger Zone
router.route("/v1/user/deactivate").delete(isUserLoggedIn, deactivateUser);
router.route("/v1/user/delete").delete(isUserLoggedIn, deleteUser);

module.exports = router;
