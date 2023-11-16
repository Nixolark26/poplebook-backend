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
    required: false,
    default:
      "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg",
  },
  coverURL: {
    type: String,
    required: false,
  },
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("Users", UserSchema);
