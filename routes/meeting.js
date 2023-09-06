const express = require("express");
const { isUserLoggedIn } = require("../middleware/middlewares");
const {
  cancelMeeting,
  deleteMeeting,
  getMeeting,
  getAllMeetings,
  createMeeting,
  updateMeeting,
  updateMeetingInvitationStatus,
} = require("../controllers/meetingController");
const router = express.Router();

router.route("/v1/meeting/create").post(isUserLoggedIn, createMeeting);
router.route("/v1/meeting").get(isUserLoggedIn, getMeeting);
router.route("/v1/meetings").get(isUserLoggedIn, getAllMeetings);
router.route("/v1/meeting/update").put(isUserLoggedIn, updateMeeting);

// Danger Zone
router.route("/v1/meeting/cancel").delete(isUserLoggedIn, cancelMeeting);
router.route("/v1/meeting/delete").delete(isUserLoggedIn, deleteMeeting);

// Accept Invitation
router
  .route("/v1/meeting/invitation/update-status")
  .put(isUserLoggedIn, updateMeetingInvitationStatus);

module.exports = router;
