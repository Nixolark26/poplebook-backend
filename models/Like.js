const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({
  postID: {
    type: String,
    required: true,
  },
  likerID: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Likes", LikeSchema);
