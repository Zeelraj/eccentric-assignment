const { MeetingLogger } = require("../logger/Logger");
const Meeting = require("../models/Meeting");
const User = require("../models/User");
const { INVITATION_STATUS } = require("../utils/constants");
const { isJSONEmpty, padTo2Digits, compareDates } = require("../utils/utils");

const isBlockedTimeSlot = (blockedTimeSlot, time) => {
  const date1 = new Date(time.end);
  const date2 = new Date(time.start);

  const day1 = `${padTo2Digits(date1.getFullYear())}-${padTo2Digits(
    date1.getMonth() + 1
  )}-${padTo2Digits(date1.getDate())}`;
  const day2 = `${padTo2Digits(date2.getFullYear())}-${padTo2Digits(
    date2.getMonth() + 1
  )}-${padTo2Digits(date2.getDate())}`;

  const blockedStartTime = `${day1}T${blockedTimeSlot.time.start}`;
  const blockedEndTime = `${day2}T${blockedTimeSlot.time.end}`;

  return blockedStartTime < time.end && blockedEndTime > time.start;
};

const isUserAvailableForMeeting = async (meeting, user) => {
  // Fetch all meetings
  const meetings = await Meeting.find({
    $and: [
      {
        isDeleted: false,
        isCancelled: false,
        isGuestReviewed: true,
        isGuestAccepted: true,
      },
      {
        $or: [{ host: user?._id }, { guest: user?._id }],
      },
      {
        "time.start": { $lt: meeting.time.end },
        "time.end": { $gt: meeting.time.start },
      },
    ],
  });

  // Time slot is available or not
  const isMeetingSlotAvailable = meetings.length <= 0;

  const isMeetingSlotAvailableFromBlockedSlots =
    user?.blockedTimeSlots?.length > 0
      ? user?.blockedTimeSlots?.filter((blockedTimeSlot) => {
          return isBlockedTimeSlot(blockedTimeSlot, meeting.time);
        })?.length <= 0
      : true;

  if (!isMeetingSlotAvailable || !isMeetingSlotAvailableFromBlockedSlots) {
    MeetingLogger.error(
      `${user?._id} is not available for the selected time slot.`
    );
    return false;
  }

  return true;
};

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

  // Meeting cannot be scheduled in the past
  if (compareDates(time.start, new Date()) < 0) {
    MeetingLogger.error("Meeting cannot be set in the past time");
    return res.status(400).json({
      success: false,
      message: "Meeting cannot be set in the past time",
    });
  }

  // Meeting cannot end before it's start time
  if (compareDates(time.start, time.end) >= 0) {
    MeetingLogger.error("Meeting cannot end before start time");
    return res.status(400).json({
      success: false,
      message: "Meeting cannot end before start time",
    });
  }

  const guest = await User.findOne({
    _id: guestId,
    active: true,
    isDeleted: false,
  });

  const meeting = new Meeting({
    host: req?.user?._id,
    title,
    agenda,
    time,
    guest: guest._id,
  });

  if (!(await isUserAvailableForMeeting(meeting, req?.user))) {
    MeetingLogger.error(
      `Host ${req?.user?._id} is not available for the selected time slot.`
    );
    return res.status(400).json({
      success: false,
      message: "You are not available for the selected time slot",
    });
  }

  if (!(await isUserAvailableForMeeting(meeting, guest))) {
    MeetingLogger.error(
      `Guest ${guest?._id} is not available for the selected time slot.`
    );
    return res.status(400).json({
      success: false,
      message: "Guest is not available for the selected time slot",
    });
  }

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
  const meeting = await Meeting.findOne({ _id: meetingId, isDeleted: false })
    .populate("host")
    .populate("guest");

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
  })
    .populate("host")
    .populate("guest");

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

  // If host or guest is accessing this function or not
  if (
    ![String(meeting?.host), String(meeting?.guest?._id)].includes(
      String(req?.user?._id)
    )
  ) {
    MeetingLogger.error("You are not authorized to access this route");
    return res.status(401).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

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
    meeting.time = !isJSONEmpty(time) ? time : meeting?.time;

    // Host is available or not
    if (!(await isUserAvailableForMeeting(meeting, meeting?.host))) {
      MeetingLogger.error(
        `Host ${meeting?.host?._id} is not available for the selected time slot.`
      );
      return res.status(400).json({
        success: false,
        message: `${
          req.user._id === meeting?.host?._id ? "You are" : "Host is"
        } not available for the selected time slot.`,
      });
    }

    // Guest is available or not
    if (!(await isUserAvailableForMeeting(meeting, meeting.guest))) {
      MeetingLogger.error(
        `Guest ${meeting?.guest?._id} is not available for the selected time slot.`
      );
      return res.status(400).json({
        success: false,
        message: `${
          req.user._id === meeting?.guest?._id ? "You are" : "Guest is"
        } not available for the selected time slot.`,
      });
    }

    meeting.isGuestAccepted = false;
    meeting.isGuestReviewed = false;

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

  // If host or guest is accessing this function or not
  if (
    ![String(meeting?.host), String(meeting?.guest)].includes(
      String(req?.user?._id)
    )
  ) {
    MeetingLogger.error("You are not authorized to access this route");
    return res.status(401).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

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

  // If host or guest is accessing this function or not
  if (
    ![String(meeting?.host), String(meeting?.guest)].includes(
      String(req?.user?._id)
    )
  ) {
    MeetingLogger.error("You are not authorized to access this route");
    return res.status(401).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

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
  })
    .populate("host")
    .populate("guest");

  // If host or guest is accessing this function or not
  if (
    ![String(meeting?.host?._id), String(meeting?.guest?._id)].includes(
      String(req?.user?._id)
    )
  ) {
    MeetingLogger.error("You are not authorized to access this route");
    return res.status(401).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

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

  let isHostAvailable = true;
  let isGuestAvailable = true;

  const acceptInvitation = async () => {
    // Host is available or not
    if (!(await isUserAvailableForMeeting(meeting, meeting?.host))) {
      MeetingLogger.error(
        `Host ${meeting?.host?._id} is not available for the selected time slot.`
      );
      isHostAvailable = false;
      meeting.isGuestAccepted = false;
      meeting.guestRejectedAt = new Date();
      meeting.isGuestReviewed = true;
      meeting.guestReviewedAt = new Date();
      return;
    }

    // Guest is available or not
    if (!(await isUserAvailableForMeeting(meeting, meeting.guest))) {
      MeetingLogger.error(
        `Host ${meeting?.guest?._id} is not available for the selected time slot.`
      );
      isGuestAvailable = false;
      meeting.isGuestAccepted = false;
      meeting.guestRejectedAt = new Date();
      meeting.isGuestReviewed = true;
      meeting.guestReviewedAt = new Date();
      return;
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

  if (status === INVITATION_STATUS.ACCEPTED) {
    await acceptInvitation();
  }

  if (status === INVITATION_STATUS.REJECT) {
    await rejectInvitation();
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

  MeetingLogger.info(
    `${meeting._id} is ${
      isHostAvailable && isGuestAvailable
        ? INVITATION_STATUS.ACCEPTED
        : INVITATION_STATUS.REJECT
    } by ${req?.user?._id}`
  );
  res.status(200).json({
    success: true,
    message: `Meeting is ${
      isHostAvailable && isGuestAvailable
        ? INVITATION_STATUS.ACCEPTED
        : INVITATION_STATUS.REJECT
    }.${!isHostAvailable ? " Host is not available." : ""}${
      !isGuestAvailable ? " Guest is not available." : ""
    }`,
    meeting,
  });
};
