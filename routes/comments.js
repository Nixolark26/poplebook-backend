const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { get } = require("mongoose");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  const comment = new Comment({
    postID: req.body.postID,
    commenterID: req.body.commenterID,
    date: req.body.date,
    content: req.body.content,
  });
  const savedComment = await comment.save();

  const notification = new Notification({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    type: "Comment",
    notificationID: Date.now(),
    viewed: false,
    path: req.body.path,
  });

  const isThereNotification = await Notification.findOne({
    path: notification.path,
    addresseeID: req.body.addresseeID,
    type: "Comment",
  });
  if (isThereNotification) {
    console.log("no saving");
    await Notification.updateOne(
      {
        path: notification.path,
        addresseeID: req.body.addresseeID,
        type: "Comment",
      },
      { $set: { viewed: false, notificationID: Date.now() } }
    );
    return;
  } else {
    if (notification.addresseeID !== req.cookies.googleId) {
      console.log("saving");

      // console.log(notification);

      notification.save();
    }
  }

  try {
    res.json(savedComment);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:commentId", async (req, res) => {
  const params = req.params.commentId.split("-");
  console.log(params);
  let skip = (params[1] - 1) * 3 + 1;
  let limit = 3;
  console.log(params[1] == 1, params[1]);
  if (params[1] == 1) {
    console.log(true);
    skip = 1;
  }

  try {
    const comments = await Comment.find({ postID: params[0] })
      .skip(skip)
      .limit(limit);
    const commentersIDs = comments.map((IDs) => (IDs = IDs.commenterID));

    const commenters = await User.find({ googleID: commentersIDs });
    comments.forEach((comment) => {
      comment.commenter = commenters.find(
        (user) => user.googleID == comment.commenterID
      );
      comment.show = false;
    });
    if (comments == undefined) comments = [];
    res.json(comments);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:likeId", async (req, res) => {
  let params = req.params.likeId.split("-");
  const postID = params[0];
  const likerID = params[1];
  try {
    const removedLike = await Comment.deleteOne({
      likerID: likerID,
      postID: postID,
    });
    console.log(params);
    res.json(removedLike);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
