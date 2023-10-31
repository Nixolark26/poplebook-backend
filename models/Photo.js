const mongoose = require("mongoose");

const photoSchema = mongoose.Schema({
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});
module.exports = mongoose.model("Photos", photoSchema);
