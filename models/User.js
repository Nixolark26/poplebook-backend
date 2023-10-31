const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  googleID: {
    type: String,
    required: true,
  },

  creationTime: {
    type: String,
    required: true,
  },
  lastSignInTime: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
    required: true,
  },
  coverURL: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Users", UserSchema);
