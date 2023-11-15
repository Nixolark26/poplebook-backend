const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { get } = require("mongoose");
const Like = require("../models/Like");
const Notification = require("../models/Notification");
router.get("/", async (req, res) => {
  try {
    const likes = await Like.find();
    res.json(likes);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  console.log("save");
  const like = new Like({
    postID: req.body.postID,
    likerID: req.cookies.googleId,
  });
  const likesLength = req.body.likes;
  if (likesLength === 9) {
    console.log("popular");
    await Post.updateOne(
      { postID: req.body.postID },
      { $set: { popular: true } }
    );
  }

  const currentLike = await Like.findOne({
    postID: req.body.postID,
    likerID: req.cookies.googleId,
  });

  const notification = new Notification({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    type: "Like",
    notificationID: Date.now(),
    viewed: false,
    path: req.body.path,
  });

  console.log("currentLike" + currentLike);
  const isThereNotification = await Notification.findOne({
    path: notification.path,
    addresseeID: req.body.addresseeID,
    type: "Like",
  });

  if (!currentLike) {
    console.log("here");
    const savedLike = await like.save();
    res.json(savedLike);
  }
  if (isThereNotification) {
    console.log("no saving");
    await Notification.updateOne(
      {
        path: notification.path,
        addresseeID: req.body.addresseeID,
        type: "Like",
      },
      { $set: { viewed: false, notificationID: Date.now() } }
    );
    return;
  } else {
    if (notification.addresseeID !== req.cookies.googleId) notification.save();
    console.log("saving");
  }

  try {
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:likeId", async (req, res) => {
  let params = req.params.likeId.split("-");
  const postID = params[0];
  const likerID = params[1];
  try {
    const removedLike = await Like.deleteOne({
      likerID: likerID,
      postID: postID,
    });
    res.json(removedLike);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
