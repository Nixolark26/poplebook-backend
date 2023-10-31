const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  senderID: {
    type: String,
    required: true,
  },
  addresseeID: {
    type: String,
    required: false,
  },
  notificationID: {
    type: String,
    required: true,
  },
  friendID: {
    type: String,
    required: false,
  },
  name: { type: String, required: false },
  photoURL: { type: String, required: false },

  viewed: { type: Boolean, required: true },
  type: { type: String, required: true },
  path: { type: String, required: false },
});

module.exports = mongoose.model("Notifications", NotificationSchema);
