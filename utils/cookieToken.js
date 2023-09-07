const { AuthLogger } = require("../logger/Logger");
const { AUTH_TYPES } = require("./constants");

/**
 *
 * Cookie Token
 *
 * Function Params
 * @param user (object): User Object
 * @param res (object): HTTP Response Object
 * @param type (string): One of the value from AUTH_TYPES.
 *
 * Response
 * @returns success (boolean): Process is successfully executed or not
 * @returns message (string): Message to be displayed to the user
 * @returns isNewUser (boolean): Indicates that current user is new user or not.
 * @returns isVerified (boolean): Indicates that current user's email and contact are verified or not.
 * @returns isAuthenticated (boolean): Indicates that current user is authenticated or not.
 * @returns isUser (boolean): Indicates that current user exists or not.
 * @returns token (string)?: JWT Token for User authentication
 * @returns user (json)?: User object with basic info
 *
 */
const cookieToken = async (user, res, type = AUTH_TYPES.LOGIN) => {
  if (!user.active) {
    AuthLogger.error("User Account is deactivated");
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      isActive: user.active,
      message: "Account is deactivated. Contact to Support For more Details...",
    });
  }

  const token = await user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  user.password = undefined;
  user.passwordRecovery.answer = undefined;

  AuthLogger.info(
    `${user?._id} is ${
      type === AUTH_TYPES.REGISTER
        ? "registered successfully."
        : "logged in successfully."
    }`
  );
  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      message:
        type === AUTH_TYPES.REGISTER
          ? "New user is registered successfully."
          : "User is logged in successfully.",
      isNewUser: type === AUTH_TYPES.REGISTER,
      isVerified: user.isEmailVerified && user.isContactVerified,
      isAuthenticated: true,
      isUser: true,
      token,
      user,
    });
};

module.exports = {
  cookieToken,
};
