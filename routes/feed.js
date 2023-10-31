const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Friend = require("../models/Friend");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Impression = require("../models/Impression");
const Comment = require("../models/Comment");

router.get("/", async (req, res) => {
  const googleID = req.cookies.googleId;
  const viewedPosts = await Impression.find({ viewerID: googleID });
  const viewedPostsIDs = viewedPosts.map((IDs) => (IDs = IDs.postID));

  let friendsIDs = await Friend.find({
    $or: [
      {
        requesterID: googleID,
        request: true,
      },
      {
        addresseeID: googleID,
        request: true,
      },
    ],
  });

  for (let i = 0; i < friendsIDs.length; i++) {
    if (friendsIDs[i].addresseeID === googleID) {
      friendsIDs[i] = friendsIDs[i].requesterID;
    } else if (friendsIDs[i].requesterID === googleID) {
      friendsIDs[i] = friendsIDs[i].addresseeID;
    }
  }

  const allPosts = await Post.find({
    publisherID: friendsIDs,
    postID: { $nin: viewedPostsIDs },
  })
    .sort({ postID: "desc" })
    .limit(10);

  if (allPosts.length === 0) {
    res.json([allPosts]);
    return;
  }

  const allLikesIds = [];
  const allReferencePostsIds = [];
  console.log("get");
  for (let i = 0; i < allPosts.length; i++) {
    allLikesIds.push(allPosts[i].postID);

    allPosts[i].comments = await Comment.find({
      postID: allPosts[i].postID,
    }).limit(1);
    if (allPosts[i].comments.length > 0) {
      allPosts[i].comments[0].commenter = await User.findOne({
        googleID: allPosts[i].comments[0].commenterID,
      });
    }

    if (allPosts[i].referencePostID) {
      allReferencePostsIds.push(allPosts[i].referencePostID);
    }
  }

  //ADDING LIKES
  const likes = await Like.find({ postID: allLikesIds });
  allPosts.forEach((post) => {
    post.likes = likes.filter((like) => post.postID === like.postID);
  });
  //ADDING REFERENCE POSTS
  const referencePosts = await Post.find({
    postID: allReferencePostsIds,
  });
  const referencePostsByIDs = groupBy(referencePosts, "publisherID");

  for (key in referencePostsByIDs) {
    const userPosts = referencePostsByIDs[key];
    const publisher = await User.findOne({ googleID: key });
    userPosts.forEach((post) => {
      post.publisher = {
        name: publisher.name,
        photoURL: publisher.photoURL,
      };
    });
  }

  allPosts.forEach((post) => {
    post.referencePost = referencePosts.find(
      (referencePost) => post.referencePostID === referencePost.postID
    );
  });

  //GETTING POST's publishers

  const postsByIDs = groupBy(allPosts, "publisherID");
  for (key in postsByIDs) {
    const userPosts = postsByIDs[key];
    const publisher = await User.findOne({ googleID: key });
    userPosts.forEach((post) => {
      post.publisher = {
        name: publisher.name,
        // googleID: publisher.googleID,
        photoURL: publisher.photoURL,
      };
    });
  }

  try {
    res.json(allPosts);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.patch("/notification", async (req, res) => {
  console.log("here");
  try {
    const firen = await Friend.find({ viewed: false });
    console.log(firen);
    const updateFriend = await Friend.updateMany(
      {
        viewed: false,
      },
      { $set: { viewed: true } }
    );
    console.log(updateFriend);
    res.json(updateFriend);
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

// console.log(req.params);
// let = req.params;
// let skip =  - 1) * 10;
// let limit = 10;
// console.log("skip", skip);
// console.log("limit", limit);
// // .skip(skip)
// .limit(limit);

// const cutoff = new Date();
// const currentDate = Date.now();
// cutoff.setDate(cutoff.getDate() - 5);
// postID: { $gt: currentDate - 8640000, $lt: currentDate },
