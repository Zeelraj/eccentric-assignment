const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const ContactPattern = /[6-9][0-9]{9}/;
const EmailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

exports.isValidEmail = (email) => {
  if (!email) {
    return false;
  }
  return EmailPattern.test(String(email).toLowerCase());
};

exports.isValidContact = (contact) => {
  if (!contact) {
    return false;
  }
  if (contact.length !== 10) {
    return false;
  }
  return ContactPattern.test(contact);
};

exports.isValidObjectId = (id) => {
  if (ObjectId.isValid(id)) {
    return String(new ObjectId(id)) === id;
  }
  return false;
};

exports.JSONToArray = (json) => {
  const array = [];
  for (const i in json) {
    if (Object.hasOwnProperty.call(json, i)) {
      array.push(json[i]);
    }
  }
  return array;
};

exports.isJSONEmpty = (json) => {
  if (!json) return false;

  return Object.keys(json).length <= 0;
};

exports.signJwtToken = async (payload, expiry = process.env.JWT_EXPIRY) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });
};
