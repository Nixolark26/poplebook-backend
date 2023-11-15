const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const cloudinary = require("../utils/cloudinary");
const Notification = require("../models/Notification");

router.post("/", async (req, res) => {
  const image = req.body.postIMG;

  const post = new Post({
    content: req.body.content,
    postID: req.body.postID,
    sharerID: req.body.sharerID,
    likes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  });
  if (req.body.publisherID) post.publisherID = req.body.publisherID;
  if (req.body.referencePostID) post.referencePostID = req.body.referencePostID;

  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "Posts-Images",
    });
    post.postIMG = result.secure_url;
  }

  try {
    post.save();
    res.json(post);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/post/:postId", async (req, res) => {
  const isThereNotification = await Notification.find({
    path: "post/" + req.params.postId,
    addresseeID: req.cookies.googleId,
  });
  console.log(isThereNotification);
  if (isThereNotification.length > 0) {
    console.log("no saving");
    const removedPost = await Notification.deleteMany({
      path: "post/" + req.params.postId,
      addresseeID: req.cookies.googleId,
    });
    console.log(removedPost);
  }

  const post = await Post.findOne({ postID: req.params.postId });
  const likes = await Like.find({ postID: req.params.postId });
  try {
    post.publisher = await User.findOne({ googleID: post.publisherID });
    if (post.referencePostID)
      post.referencePost = await Post.findOne({
        postID: post.referencePostID,
      });
    if (post.referencePost?.publisherID)
      post.referencePost.publisher = await User.findOne({
        googleID: post.referencePost.publisherID,
      });

    post.comments = await Comment.find({
      postID: req.params.postId,
    }).limit(3);

    for (let i = 0; i < post.comments.length; i++) {
      if (post.comments.length > 0) {
        post.comments[i].commenter = await User.findOne({
          googleID: post.comments[i].commenterID,
        });
      }
    }

    if (likes) {
      console.log("adding Likes");
      post.likes.push(...likes);
    }

    res.json(post);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:postId", async (req, res) => {
  const params = req.params.postId.split("-");
  let userId = params[0];
  const page = params[1];
  let skip = (page - 1) * 3;
  let limit = 3;
  const isThereNotification = await Notification.find({
    path: params[0],
    addresseeID: req.cookies.googleId,
  });

  if (isThereNotification.length > 0) {
    console.log("no saving");
    const removedPost = await Notification.deleteMany({
      path: params[0],
      addresseeID: req.cookies.googleId,
    });
    console.log(removedPost);
  }

  if (userId === "currentUser") userId = req.cookies.googleId;
  console.log(userId);
  console.log(req.cookies);
  const profilePublisher = await User.findOne({ googleID: userId });
  try {
    let postsProfile = await Post.find({
      publisherID: userId,
    })
      .sort({ postID: "desc" })
      .skip(skip)
      .limit(limit);

    const postsIDs = [];
    const groupedPostsIDs = groupBy(postsProfile, "postID");
    for (const id in groupedPostsIDs) {
      postsIDs.push(id);
    }
    const likes = await Like.find({ postID: postsIDs });

    const referencePostsIDs = [];
    const groupedReferencePostsIDs = groupBy(postsProfile, "referencePostID");
    for (const id in groupedReferencePostsIDs) {
      referencePostsIDs.push(id);
    }

    const referencePosts = await Post.find({ postID: referencePostsIDs });
    const publishersIDs = [];
    const groupedPublishersIDs = groupBy(referencePosts, "publisherID");
    for (const id in groupedPublishersIDs) {
      publishersIDs.push(id);
    }
    const publishers = await User.find({ googleID: publishersIDs });
    postsProfile.forEach((post) => {
      post.publisher = profilePublisher;
      const likesToPush = likes.filter((like) => like.postID === post.postID);
      console.log(likesToPush);
      post.likes.push(...likesToPush);
      if (post?.referencePostID) {
        post.referencePost = referencePosts.find(
          (referencePost) => referencePost.postID === post.referencePostID
        );
        if (post.referencePost) {
          post.referencePost.publisher = publishers.find(
            (publisher) => post.referencePost.publisherID === publisher.googleID
          );
        }
      }
    });

    for (let i = 0; i < postsProfile.length; i++) {
      postsProfile[i].comments = await Comment.find({
        postID: postsProfile[i].postID,
      }).limit(1);
      if (postsProfile[i].comments.length > 0) {
        postsProfile[i].comments[0].commenter = await User.findOne({
          googleID: postsProfile[i].comments[0].commenterID,
        });
      }
    }

    res.json([postsProfile, profilePublisher]);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const removedPost = await Post.deleteOne({
      postID: req.params.postId,
    });
    res.json(removedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

router.patch("/:postId", async (req, res) => {
  try {
    const updatePost = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title } }
    );
    res.json(updatePost);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
