const { AuthLogger } = require("../logger/Logger");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isValidEmail, isValidContact, isJSONEmpty } = require("../utils/utils");
const { cookieToken } = require("../utils/cookieToken");
const { AUTH_TYPES } = require("../utils/constants");

/**
 *
 * Register User
 *
 * Request Body
 * @param name (string): User Name
 * @param email (string): User Email. It must be unique.
 * @param contact (string): User Contact. It must be unique.
 * @param password (string): Password of the User
 * @param cnfPassword (string): Confirm Password of the User
 * @param passwordRecovery (object): Details about the password recovery
 * @param passwordRecovery.question (string): Id of the recovery question
 * @param passwordRecovery.answer (string): Answer of the recovery question
 *
 * Response
 * @returns cookieToken()
 *
 */
exports.registerUser = async (req, res) => {
  const requiredFields = [
    "name",
    "email",
    "contact",
    "password",
    "cnfPassword",
    "passwordRecovery",
  ];

  if (isJSONEmpty(req.body)) {
    AuthLogger.error("Request body is missing");
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  for (const iterator in req.body) {
    if (requiredFields.includes(iterator) && !req.body[iterator]) {
      AuthLogger.error(`${iterator} is missing`);
      return res.status(400).json({
        success: false,
        message: `Please, provide ${iterator}`,
      });
    }
  }

  if (
    !req.body?.passwordRecovery?.question ||
    !req.body?.passwordRecovery?.answer
  ) {
    AuthLogger.error("Password recovery details are missing");
    return res.status(400).json({
      success: false,
      message: "Password recovery details are missing",
    });
  }

  const { name, email, contact, password, cnfPassword, passwordRecovery } =
    req.body;

  if (String(password).length < 8) {
    AuthLogger.error("Password length is not valid");
    return res.status(400).json({
      success: false,
      message: "Password must be greater than 8 characters",
    });
  }

  if (password !== cnfPassword) {
    AuthLogger.error("Confirm Password is not valid");
    return res.status(400).json({
      success: false,
      message: "Confirm Password is not same as Password",
    });
  }

  if (!isValidEmail(email)) {
    AuthLogger.error("Email format is not valid");
    return res.status(203).json({
      success: false,
      message: "Email format is not valid",
    });
  }

  if (!isValidContact(contact)) {
    AuthLogger.error("Contact format is not valid");
    return res.status(203).json({
      success: false,
      message: "Contact format is not valid",
    });
  }

  const isUserWithEmailExists = (await User.find({ email })).length > 0;

  if (isUserWithEmailExists) {
    AuthLogger.error(`User already exists with email: ${email}`);
    return res.status(203).json({
      success: false,
      message: "User with email already exists",
    });
  }

  const isUserWithContactExists = (await User.find({ contact })).length > 0;

  if (isUserWithContactExists) {
    AuthLogger.error(`User already exists with contact: ${contact}`);
    return res.status(203).json({
      success: false,
      message: "User with contact already exists",
    });
  }

  const user = new User({
    name,
    email,
    contact,
    password: await bcrypt.hash(password, 10),
    passwordRecovery,
  });

  try {
    await user.save();
  } catch (error) {
    AuthLogger.error(`User is not created - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not created.",
    });
  }

  cookieToken(user, res, AUTH_TYPES.REGISTER);
};

/**
 *
 * Login User
 *
 * Request Body
 * @param email (string): User Email. It must be unique.
 * @param password (string): Password of the User
 *
 * Response
 * @returns cookieToken()
 *
 */
exports.loginUser = async (req, res) => {
  // Validate request fields
  const requiredFields = ["email", "password"];

  if (isJSONEmpty(req.body)) {
    AuthLogger.error("Request body is missing");
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  for (const iterator in req.body) {
    if (requiredFields.includes(iterator) && !req.body[iterator]) {
      AuthLogger.error(`${iterator} is missing`);
      return res.status(400).json({
        success: false,
        message: `Please, provide ${iterator}`,
      });
    }
  }

  const { email, password } = req.body;

  // Fetch user
  const user = await User.findOne({ email });

  // If user not found in DB
  if (!user) {
    AuthLogger.error(`No user is found with email: ${email}`);
    return res.status(404).json({
      success: false,
      message: "No user is found",
    });
  }

  // If User is not Active
  if (!user.active) {
    AuthLogger.error(`User is not active with email: ${email}`);
    return res.status(403).json({
      success: false,
      message:
        "Sorry This account is deactivated, Please contact to Support..!!",
    });
  }

  // If Password is incorrect
  if (!(await user.isValidatedPassword(password))) {
    AuthLogger.error(`Password is not valid for ${user?._id}`);
    return res.status(400).json({
      success: false,
      message: "Please, Provide correct password..!!",
    });
  }

  user.lastLogin = new Date();
  user.totalLogin = user.totalLogin + 1;

  if (user.loginHistory.length > 0) {
    user.loginHistory.push(new Date());
  } else {
    user.loginHistory = [new Date()];
  }

  try {
    await user.save();
  } catch (error) {
    AuthLogger.error(`User is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not updated.",
    });
  }

  cookieToken(user, res, AUTH_TYPES.LOGIN);
};

/**
 *
 * Logout User
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns isLoggedOut (boolean): Indicates that user is logged out or not
 *
 */
exports.logoutUser = async (req, res) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  AuthLogger.info(`${req?.user?._id} is logged out`);
  res.status(200).cookie("token", null, options).json({
    success: true,
    isLoggedOut: true,
    message: "User is logged out",
  });
};

/**
 *
 * Authenticate User
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns isVerified (boolean): Indicates that user account is verified or not
 * @returns user (object): Object of the user
 *
 */
exports.authenticateUser = async (req, res) => {
  AuthLogger.info(`${req.user._id} is Authenticated`);
  res.status(200).json({
    success: true,
    message: "User is Authenticated",
    user: req.user,
  });
};

/**
 *
 * Reset Password
 *
 * Request Body
 * @param email (string): Email of the user.
 * @param answer (string): Recovery question's answer.
 * @param password (string): New password.
 * @param cnfPassword (string): Re-entered new password.
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 *
 */
exports.passwordReset = async (req, res) => {
  const requiredFields = ["email", "answer", "password", "cnfPassword"];

  if (isJSONEmpty(req.body)) {
    AuthLogger.error("Required fields are missing");
    return res.status(400).json({
      success: false,
      message: "Required fields are missing",
    });
  }

  for (const iterator in req.body) {
    if (requiredFields.includes(iterator) && !req.body[iterator]) {
      AuthLogger.error(`${iterator} is missing`);
      return res.status(400).json({
        success: false,
        message: `Provide ${iterator}`,
      });
    }
  }

  const { email, answer, password, cnfPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    AuthLogger.error("User does not exists");
    return res.status(400).json({
      success: false,
      message: "User with this email does not exists..!!",
    });
  }

  if (
    user?.passwordRecovery?.answer?.toLowerCase() !==
    String(answer)?.toLowerCase()
  ) {
    AuthLogger.error("Password recovery verification is failed");
    return res.status(401).json({
      success: false,
      message: "Password recovery verification is failed..!!",
    });
  }

  if (password !== cnfPassword) {
    AuthLogger.error("Confirm password does not match with new password");
    return res.status(400).json({
      success: false,
      message: "New password and confirm password does not match..!!",
    });
  }

  if (await bcrypt.compare(password, user?.password)) {
    AuthLogger.error("New password cannot be same as the old password");
    return res.status(400).json({
      success: false,
      message: "New password cannot be same as the old password..!!",
    });
  }

  user.password = await bcrypt.hash(password, 10);

  // Update the user with new password
  try {
    await user.save();
  } catch (error) {
    AuthLogger.error(`User is not updated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. User is not updated.",
    });
  }

  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };

  AuthLogger.info(`Password is updated successfully for ${user?._id}`);
  res.status(200).cookie("token", null, options).json({
    success: true,
    isLoggedOut: true,
    message: "Password is updated successfully",
  });
};
