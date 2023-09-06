const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Please, provide User Id of the guest"],
  },
  title: {
    type: String,
    required: [true, "Please, provide title of the meeting"],
  },
  agenda: {
    type: String,
    required: [true, "Please, provide agenda of the meeting"],
  },
  time: {
    start: {
      type: String,
      required: [true, "Please, provide start time of the meeting"],
    },
    end: {
      type: String,
      required: [true, "Please, provide end time of the meeting"],
    },
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Please, provide User Id of the guest"],
  },
  isGuestAccepted: {
    type: Boolean,
    default: false,
  }, // NOTE Guest accepted meeting invitation or not (default: false)
  guestAcceptedAt: {
    type: Date,
  },
  guestRejectedAt: {
    type: Date,
  },
  isGuestReviewed: {
    type: Boolean,
    default: false,
  }, // NOTE Guest reviewed meeting invitation or not (default: false)
  guestReviewedAt: {
    type: Date,
  },
  isReviewRequestSent: {
    type: Boolean,
    default: false,
  }, // NOTE Request for the meeting is sent or not to the guest
  reviewRequestSentAt: {
    type: Date,
  },
  totalReviewRequests: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: {
    type: Date,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }, // NOTE Both user and guest can update the meeting details
  isCancelled: {
    type: Boolean,
    default: false,
  },
  cancelledAt: {
    type: Date,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }, // NOTE Both user and guest can cancel the meeting
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }, // NOTE Only user who have created the meeting can delete the meeting
});

module.exports = mongoose.model("meetings", MeetingSchema);
