const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  content: {
    type: String,
    required: false,
  },
  publisherID: {
    type: String,
    required: true,
  },
  postID: {
    type: String,
    required: true,
  },
  postIMG: {
    type: String,
    required: false,
  },
  publisher: {
    type: Object,
    required: false,
  },
  likes: {
    type: Array,
    required: false,
  },
  comments: {
    type: Array,
    required: false,
  },
  referencePostID: { type: String, required: false },
  referencePost: { type: Object, required: false },

  sharerID: {
    type: String,
    required: false,
  },
  sharer: {
    type: Object,
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  viewed: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Posts", PostSchema);
