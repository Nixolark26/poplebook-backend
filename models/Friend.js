const mongoose = require("mongoose");

const FriendSchema = mongoose.Schema({
  requesterID: {
    type: String,
    required: true,
  },

  addresseeID: {
    type: String,
    required: true,
  },
  request: {
    type: Boolean,
    required: true,
  },
  requester: {
    type: Object,
    required: false,
  },
  addressee: {
    type: Object,
    required: false,
  },
  friend: {
    type: Object,
    required: false,
  },
  friendID: {
    type: String,
    required: false,
  },
  viewed: { type: Boolean, required: false },
});

module.exports = mongoose.model("Friends", FriendSchema);
