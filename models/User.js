const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  googleID: {
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

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("Users", UserSchema);
