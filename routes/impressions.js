const express = require("express");
const router = express.Router();
const Impression = require("../models/Impression");

router.post("/", async (req, res) => {
  const viewedPost = new Impression({
    postID: req.body.postID,
    viewerID: req.cookies.googleId,
  });

  try {
    viewedPost.save();
    res.json(viewedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
