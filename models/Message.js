const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
  content: {
    type: String,
    required: false,
  },
  addresseeID: {
    type: String,
    required: true,
  },

  senderID: {
    type: String,
    required: true,
  },

  addressee: {
    type: Object,
    required: false,
  },
  sender: {
    type: Object,
    required: false,
  },
  date: { type: String, required: true },
  image: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Messages", MessageSchema);
