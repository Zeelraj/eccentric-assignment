const { MeetingLogger } = require("../logger/Logger");
const Meeting = require("../models/Meeting");
const User = require("../models/User");
const { INVITATION_STATUS } = require("../utils/constants");
const { isJSONEmpty } = require("../utils/utils");

/**
 *
 * Create Meeting
 *
 * Request Body
 * @param title (string)?: Title of the meeting
 * @param agenda (string)?: Agenda of the meeting
 * @param time (object)?: Time slot object of the meeting
 * @param time.start (string)?: Start of the meeting
 * @param time.end (string)?: End of the meeting
 * @param guest (string)?: Object of the Guest
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns user (object): Updated user object
 *
 */
exports.createMeeting = async (req, res) => {
  const requiredFields = ["title", "agenda", "time", "guest"];

  if (isJSONEmpty(req.body)) {
    MeetingLogger.error("Request body is missing");
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  for (const iterator in req.body) {
    if (requiredFields.includes(iterator) && !req.body[iterator]) {
      MeetingLogger.error(`${iterator} is missing`);
      return res.status(400).json({
        success: false,
        message: `Please, provide ${iterator}`,
      });
    }
  }

  const { title = "", agenda = "", time = {}, guest: guestId = "" } = req.body;

  const guest = await User.findOne({
    _id: guestId,
    active: true,
    isDeleted: false,
  });

  // Fetch all meetings
  const meetings = await Meeting.find({
    $and: [
      { isDeleted: false, isCancelled: false, isGuestAccepted: true },
      {
        $or: [{ host: guest?._id }, { guest: guest?._id }],
      },
    ],
  });

  // Time slot is available or not
  const isMeetingSlotAvailable =
    meetings.filter((meeting) => {
      return meeting.time.start < time.end && meeting.time.end > time.start;
    }).length <= 0;

  const isMeetingSlotAvailableFromBlockedSlots =
    guest.blockedTimeSlots.filter((blockedTimeSlot) => {
      return (
        blockedTimeSlot.time.start < time.end &&
        blockedTimeSlot.time.end > time.start
      );
    }).length <= 0;

  if (!isMeetingSlotAvailable || !isMeetingSlotAvailableFromBlockedSlots) {
    MeetingLogger.error(
      `Guest ${guest?._id} is not available for the selected time slot.`
    );
    return res.status(400).json({
      success: false,
      message: "Guest is not available for the selected time slot",
    });
  }

  const meeting = new Meeting({
    host: req?.user?._id,
    title,
    agenda,
    time,
    guest: guest._id,
  });

  // Send Email Code Here

  meeting.isReviewRequestSent = true;
  meeting.reviewRequestSentAt = new Date();
  meeting.totalReviewRequests = meeting.totalReviewRequests + 1;

  try {
    await meeting.save();
  } catch (error) {
    MeetingLogger.error(`Meeting is not created - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Meeting is not created.",
    });
  }

  MeetingLogger.info(
    `Meeting ${meeting._id} is created successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "Meeting is created successfully",
    meeting,
  });
};

/**
 *
 * Get Meeting
 *
 * Request Query
 * @param meetingId (string)?: Object Id of the meeting
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns meeting (object): Meeting object
 *
 */
exports.getMeeting = async (req, res) => {
  const { meetingId } = req.query;

  if (!meetingId) {
    MeetingLogger.error("Meeting Id is missing");
    return res.status(400).json({
      success: false,
      message: "MeetingId is missing",
    });
  }

  // Fetch meeting
  const meeting = await Meeting.findOne({ _id: meetingId, isDeleted: false });

  // If meeting not found in DB
  if (!meeting) {
    MeetingLogger.error(`No meeting is found with meetingId: ${meetingId}`);
    return res.status(404).json({
      success: false,
      message: "No meeting is found",
    });
  }

  MeetingLogger.info(
    `${meeting._id} is fetched successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "Meeting is fetched successfully",
    meeting,
  });
};

/**
 *
 * Get All Meetings (Of Particular User)
 *
 * Request Query
 * @param userId (string)?: Object Id of the user
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns meetings ([object]): Array of meetings
 *
 */
exports.getAllMeetings = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    MeetingLogger.error("User Id is missing");
    return res.status(400).json({
      success: false,
      message: "UserId is missing",
    });
  }

  // Fetch all meetings
  const meetings = await Meeting.find({
    $and: [
      { isDeleted: false },
      {
        $or: [{ host: userId }, { guest: userId }],
      },
    ],
  });

  MeetingLogger.info(
    `All meetings are fetched successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "All meetings are fetched successfully",
    meetings,
  });
};

/**
 *
 * Update Meeting
 *
 * Request Query
 * @param meetingId (string)?: Object Id of the meeting
 *
 * Request Body
 * @param title (string)?: Title of the meeting
 * @param agenda (string)?: Agenda of the meeting
 * @param time (object)?: Time slot object of the meeting
 * @param time.start (string)?: Start of the meeting
 * @param time.end (string)?: End of the meeting
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns user (object): Updated user object
 *
 */
exports.updateMeeting = async (req, res) => {
  const { meetingId } = req.query;

  if (!meetingId) {
    MeetingLogger.error("Meeting Id is missing");
    return res.status(400).json({
      success: false,
      message: "MeetingId is missing",
    });
  }

  const { title = "", agenda = "", time = {} } = req.body;

  // Fetch meeting
  const meeting = await Meeting.findOne({
    _id: meetingId,
    isDeleted: false,
  }).populate("guest");

  // If meeting not found in DB
  if (!meeting) {
    MeetingLogger.error(`No meeting is found with meetingId: ${meetingId}`);
    return res.status(404).json({
      success: false,
      message: "No meeting is found",
    });
  }

  // If meeting is cancelled
  if (meeting.isCancelled) {
    MeetingLogger.error(`Meeting with Id ${meetingId} is cancelled`);
    return res.status(404).json({
      success: false,
      message: "Meeting is cancelled",
    });
  }

  // If time slot is updated
  if (!isJSONEmpty(time)) {
    // Fetch all meetings
    const meetings = await Meeting.find({
      $and: [
        { isDeleted: false, isCancelled: false },
        {
          $or: [{ host: meeting?.guest?._id }, { guest: meeting?.guest?._id }],
        },
      ],
    });

    // Time slot is available or not
    const isMeetingSlotAvailable =
      meetings.filter((meeting) => {
        return meeting.time.start < time.end && meeting.time.end > time.start;
      }).length <= 0;

    const isMeetingSlotAvailableFromBlockedSlots =
      guest.blockedTimeSlots.filter((blockedTimeSlot) => {
        return (
          blockedTimeSlot.time.start < time.end &&
          blockedTimeSlot.time.end > time.start
        );
      }).length <= 0;

    if (!isMeetingSlotAvailable || !isMeetingSlotAvailableFromBlockedSlots) {
      MeetingLogger.error(
        `Guest ${meeting?.guest?._id} is not available for the selected time slot.`
      );
      return res.status(400).json({
        success: false,
        message: "Guest is not available for the selected time slot",
      });
    }

    meeting.time = !isJSONEmpty(time) ? time : meeting?.time;
    meeting.isGuestAccepted = false;
    meeting.isGuestReviewed = false;

    // Send Email Code Here

    meeting.isReviewRequestSent = true;
    meeting.reviewRequestSentAt = new Date();
    meeting.totalReviewRequests = meeting.totalReviewRequests + 1;
  }

  meeting.title = title || meeting?.title;
  meeting.agenda = agenda || meeting?.agenda;
  meeting.lastUpdatedAt = new Date();
  meeting.lastUpdatedBy = req?.user?._id;

  try {
    await meeting.save();
  } catch (error) {
    MeetingLogger.error(`Meeting is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Meeting is not updated.",
    });
  }

  MeetingLogger.info(
    `${meeting._id} is updated successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "Meeting is updated successfully",
    meeting,
  });
};

/**
 *
 * Cancel Meeting
 *
 * Request Query
 * @param meetingId (string)?: Object Id of the meeting
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns meeting (object): Meeting object
 *
 */
exports.cancelMeeting = async (req, res) => {
  const { meetingId } = req.query;

  if (!meetingId) {
    MeetingLogger.error("Meeting Id is missing");
    return res.status(400).json({
      success: false,
      message: "MeetingId is missing",
    });
  }

  // Fetch meeting
  const meeting = await Meeting.findOne({ _id: meetingId, isDeleted: false });

  // If meeting not found in DB
  if (!meeting) {
    MeetingLogger.error(`No meeting is found with meetingId: ${meetingId}`);
    return res.status(404).json({
      success: false,
      message: "No meeting is found",
    });
  }

  // If meeting is already cancelled
  if (meeting.isCancelled) {
    MeetingLogger.error(`Meeting with Id ${meetingId} is already cancelled`);
    return res.status(404).json({
      success: false,
      message: "Meeting is already cancelled",
    });
  }

  meeting.isCancelled = true;
  meeting.cancelledAt = new Date();
  meeting.cancelledBy = req?.user?._id;

  try {
    await meeting.save();
  } catch (error) {
    MeetingLogger.error(`Meeting is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Meeting is not updated.",
    });
  }

  MeetingLogger.info(
    `${meeting._id} is cancelled successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "Meeting is cancelled successfully",
    meeting,
  });
};

/**
 *
 * Delete Meeting
 *
 * Request Query
 * @param meetingId (string)?: Object Id of the meeting
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 *
 */
exports.deleteMeeting = async (req, res) => {
  const { meetingId } = req.query;

  if (!meetingId) {
    MeetingLogger.error("Meeting Id is missing");
    return res.status(400).json({
      success: false,
      message: "MeetingId is missing",
    });
  }

  // Fetch meeting
  const meeting = await Meeting.findOne({ _id: meetingId, isDeleted: false });

  // If meeting not found in DB
  if (!meeting) {
    MeetingLogger.error(`No meeting is found with meetingId: ${meetingId}`);
    return res.status(404).json({
      success: false,
      message: "No meeting is found",
    });
  }

  meeting.isDeleted = true;
  meeting.deletedAt = new Date();
  meeting.deletedBy = req?.user?._id;

  try {
    await meeting.save();
  } catch (error) {
    MeetingLogger.error(`Meeting is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Meeting is not updated.",
    });
  }

  MeetingLogger.info(
    `${meeting._id} is deleted successfully by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: "Meeting is deleted successfully",
  });
};

/**
 *
 * Update Meeting Invitation Status
 *
 * Request Query
 * @param meetingId (string)?: Object Id of the meeting
 *
 * Request Body
 * @param status (string)?: Invitation approval status from INVITATION_STATUS
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns user (object): Updated user object
 *
 */
exports.updateMeetingInvitationStatus = async (req, res) => {
  const { meetingId } = req.query;

  if (!meetingId) {
    MeetingLogger.error("Meeting Id is missing");
    return res.status(400).json({
      success: false,
      message: "MeetingId is missing",
    });
  }

  const { status = "" } = req.body;

  if (!status) {
    MeetingLogger.error("Approval status is missing");
    return res.status(400).json({
      success: false,
      message: "Approval status is missing",
    });
  }

  // Fetch meeting
  const meeting = await Meeting.findOne({
    _id: meetingId,
    isDeleted: false,
  }).populate("guest");

  // If meeting not found in DB
  if (!meeting) {
    MeetingLogger.error(`No meeting is found with meetingId: ${meetingId}`);
    return res.status(404).json({
      success: false,
      message: "No meeting is found",
    });
  }

  // If meeting is cancelled
  if (meeting.isCancelled) {
    MeetingLogger.error(`Meeting with Id ${meetingId} is cancelled`);
    return res.status(404).json({
      success: false,
      message: "Meeting is cancelled",
    });
  }

  // If meeting is cancelled
  if (meeting.isGuestAccepted) {
    MeetingLogger.error(
      `${meeting.guest?._id} has already accepted the invitation`
    );
    return res.status(203).json({
      success: false,
      message: "You have already accepted the invitation",
    });
  }

  // User validation
  if (String(req?.user?._id) !== String(meeting?.guest?._id)) {
    MeetingLogger.error(
      `${req?.user?._id} is not allowed to access this invitation`
    );
    return res.status(401).json({
      success: false,
      message: "You are not allowed to access this invitation",
    });
  }

  const acceptInvitation = async () => {
    // Fetch all meetings
    const meetings = await Meeting.find({
      $and: [
        { isDeleted: false, isCancelled: false },
        {
          $or: [{ host: meeting?.guest?._id }, { guest: meeting?.guest?._id }],
        },
      ],
    });

    // Time slot is available or not
    const isMeetingSlotAvailable =
      meetings.filter((_meeting) => {
        return (
          _meeting.time.start < meeting.time.end &&
          _meeting.time.end > meeting.time.start
        );
      }).length <= 0;

    const isMeetingSlotAvailableFromBlockedSlots =
      guest.blockedTimeSlots.filter((blockedTimeSlot) => {
        return (
          blockedTimeSlot.time.start < meeting.time.end &&
          blockedTimeSlot.time.end > meeting.time.start
        );
      }).length <= 0;

    if (!isMeetingSlotAvailable || !isMeetingSlotAvailableFromBlockedSlots) {
      MeetingLogger.error(
        `${meeting?.guest?._id} is not available for the selected time slot.`
      );
      return res.status(400).json({
        success: false,
        message: "You are not available for the selected time slot",
      });
    }

    meeting.isGuestAccepted = true;
    meeting.guestAcceptedAt = new Date();
    meeting.isGuestReviewed = true;
    meeting.guestReviewedAt = new Date();
  };

  const rejectInvitation = async () => {
    meeting.isGuestAccepted = false;
    meeting.guestRejectedAt = new Date();
    meeting.isGuestReviewed = true;
    meeting.guestReviewedAt = new Date();
  };

  switch (status) {
    case INVITATION_STATUS.ACCEPTED:
      acceptInvitation();
      break;

    case INVITATION_STATUS.REJECT:
      rejectInvitation();
      break;
  }

  try {
    await meeting.save();
  } catch (error) {
    MeetingLogger.error(`Meeting is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Meeting is not updated.",
    });
  }

  MeetingLogger.info(`${meeting._id} is ${status} by ${req?.user?._id}`);
  res.status(200).json({
    success: true,
    message: `Meeting is ${status}`,
    meeting,
  });
};
