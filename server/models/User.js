const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { signJwtToken } = require("../utils/utils");

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
  contact: {
    type: String,
    required: [true, "Please provide a contact"],
    maxLength: [10, "Contact must be of 10 characters only"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  passwordRecovery: {
    question: {
      type: String,
      required: [true, "Please, provide password recovery question's Id"],
    },
    answer: {
      type: String,
      required: [true, "Please, provide password recovery question's answer"],
    },
  },
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
