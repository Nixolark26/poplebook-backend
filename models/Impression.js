const mongoose = require("mongoose");

const ImpressionSchema = mongoose.Schema({
  postID: {
    type: String,
    required: true,
  },
  viewerID: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Impressions", ImpressionSchema);
