const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { signJwtToken } = require("../utils/utils");

/**
 *
 * NOTE
 * Blocked Time slots will be of 1 hour, only.
 * User can select as many slots of 1 hour as s/he wants.
 * Hours will be stored in 24 hours format, but will be displayed in 12 hours format.
 *
 */
const BlockedTimeSlot = new mongoose.Schema({
  time: {
    start: {
      type: String,
      required: [true, "Please, provide start time of the blocked slot"],
    },
    end: {
      type: String,
      required: [true, "Please, provide end time of the blocked slot"],
    },
  },
});

const PasswordRecoverySchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please, provide password recovery question's Id"],
  },
  answer: {
    type: String,
    required: [true, "Please, provide password recovery question's answer"],
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    validate: [validator.isEmail, "Please, enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false, // NOTE Password will not be fetched until explicitly fetched
  },
  passwordRecovery: {
    type: PasswordRecoverySchema,
  },
  blockedTimeSlots: [BlockedTimeSlot],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  deactivatedAt: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  totalLogin: {
    type: Number,
    default: 0,
  },
  loginHistory: [Date],
  lastUserUpdated: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
});

// Validate the Password with passed on user password
UserSchema.methods.isValidatedPassword = async function (userSendPassword) {
  if (!this.password) {
    return false;
  }

  return await bcrypt.compare(userSendPassword, this.password);
};

// Create and return JWT token
UserSchema.methods.getJwtToken = function () {
  const payload = { id: this._id };
  return signJwtToken(payload, process.env.JWT_EXPIRY_LONG);
};

module.exports = mongoose.model("users", UserSchema);
