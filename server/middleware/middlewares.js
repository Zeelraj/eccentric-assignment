const { AuthLogger } = require("../logger/Logger");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.isUserLoggedIn = async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.headers["x-access-token"] ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    AuthLogger.error("Token is missing");
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Login First to access this page...",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    AuthLogger.error(`User is not authenticated - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "User is not Authenticated..!!",
    });
  }

  if (!decoded) {
    AuthLogger.error("Token is expired");
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: "Token is Expired. Please, Login again..!!",
    });
  }

  const user = await User.findById(decoded.id);

  if (user.isDeleted) {
    AuthLogger.error(`${user._id} is deleted`);
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message:
        "Your profile is deleted. Please, create a new one or contact a support..!!",
    });
  }

  if (!user.active) {
    AuthLogger.error(`${user._id} is not active`);
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      isActive: user.active,
      message:
        "Your profile is deactivated. Contact to Support For more Details...",
    });
  }

  user.password = undefined;
  user.passwordRecovery.answer = undefined;

  req.user = user;

  next();
};
