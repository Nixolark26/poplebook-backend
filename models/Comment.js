const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  postID: {
    type: String,
    required: true,
  },
  commenterID: {
    type: String,
    required: true,
  },
  commenter: {
    type: Object,
    required: false,
  },
  date: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Comments", CommentSchema);
