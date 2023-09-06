const { UserLogger } = require("../logger/Logger");
const User = require("../models/User");

/**
 *
 * Get User
 *
 * Request Query
 * @param userId (string)?: Object Id of the user
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns user (object): User object
 *
 */
exports.getUser = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    UserLogger.error("User Id is missing");
    return res.status(400).json({
      success: false,
      message: "UserId is missing",
    });
  }

  // Fetch user
  const user = await User.findOne({ _id: userId, isDeleted: false });

  // If user not found in DB
  if (!user) {
    UserLogger.error(`No user is found with userId: ${userId}`);
    return res.status(404).json({
      success: false,
      message: "No user is found",
    });
  }

  // If User is not Active
  if (!user.active) {
    UserLogger.error(`User is not active with userId: ${userId}`);
    return res.status(403).json({
      success: false,
      message:
        "Sorry This account is deactivated, Please contact to Support..!!",
    });
  }

  UserLogger.info(`${user._id} is fetched successfully by ${req?.user?._id}`);
  res.status(200).json({
    success: true,
    message: "User is fetched successfully",
    user,
  });
};

/**
 *
 * Get All Users
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns users ([object]): Array of users
 *
 */
exports.getAllUsers = async (req, res) => {
  // Fetch all users
  const users = await User.find({ active: true, isDeleted: false });

  UserLogger.info(`All users are fetched successfully by ${req?.user?._id}`);
  res.status(200).json({
    success: true,
    message: "All users are fetched successfully",
    users,
  });
};

/**
 *
 * Update User
 *
 * Request Body
 * @param name (string)?: Name of the user
 * @param blockedTimeSlots ([object])?: Off-hours marked by the user
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns user (object): Updated user object
 *
 */
exports.updateUser = async (req, res) => {
  const { name = "", blockedTimeSlots = [] } = req.body;

  // Fetch user
  const user = await User.findOne({ _id: req.user._id, isDeleted: false });

  user.name = name || user?.name;
  user.blockedTimeSlots =
    blockedTimeSlots?.length > 0 ? blockedTimeSlots : user?.blockedTimeSlots;
  user.lastUserUpdated = new Date();

  try {
    await user.save();
  } catch (error) {
    UserLogger.error(`User is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not updated.",
    });
  }

  UserLogger.info(`${user._id} is updated successfully`);
  res.status(200).json({
    success: true,
    message: "User is updated successfully",
    user,
  });
};

/**
 *
 * Deactivate User
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns isLoggedOut (boolean): Indicates that user is logged out or not
 * @returns message (string): Message to be displayed to the user
 *
 */
exports.deactivateUser = async (req, res) => {
  // Fetch user
  const user = await User.findOne({ _id: req.user._id, isDeleted: false });

  user.active = false;
  user.deactivatedAt = new Date();

  try {
    await user.save();
  } catch (error) {
    UserLogger.error(`User is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not updated.",
    });
  }

  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  UserLogger.info(`${user._id} is deactivated successfully`);
  res.status(200).cookie("token", null, options).json({
    success: true,
    isLoggedOut: true,
    message: "User is deactivated successfully",
  });
};

/**
 *
 * Delete User
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns isLoggedOut (boolean): Indicates that user is logged out or not
 * @returns message (string): Message to be displayed to the user
 *
 */
exports.deleteUser = async (req, res) => {
  // Fetch user
  const user = await User.findOne({ _id: req.user._id, isDeleted: false });

  user.isDeleted = true;
  user.deletedAt = new Date();

  try {
    await user.save();
  } catch (error) {
    UserLogger.error(`User is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not updated.",
    });
  }

  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  UserLogger.info(`${user._id} is deleted successfully`);
  res.status(200).cookie("token", null, options).json({
    success: true,
    isLoggedOut: true,
    message: "User is deleted successfully",
  });
};
