const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Friend = require("../models/Friend");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Impression = require("../models/Impression");
const Comment = require("../models/Comment");

router.get("/:page", async (req, res) => {
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
  // const cutoff = new Date();
  // const currentDate = Date.now();
  // cutoff.setDate(cutoff.getDate() - 5);
  // postID: { $gt: currentDate - 8640000, $lt: currentDate },
  const page = (req.params.page - 1) * 3;

  const popularPosts = await Post.find({
    popular: true,
    publisherID: { $nin: req.cookies.googleId },
  })

    .sort({ postID: "desc" })
    .skip(page)
    .limit(3);

  const skipFriends = (req.params.page - 1) * 7;
  const popularPostIDs = popularPosts.map((post) => post.postID);

  const allPosts = await Post.find({
    publisherID: friendsIDs,
    postID: { $nin: [...viewedPostsIDs, ...popularPostIDs] },

    popular: { $ne: true },
  })
    .sort({ postID: "desc" })
    .skip(skipFriends)
    .limit(7);

  allPosts.push(...popularPosts);

  function compare(a, b) {
    if (a.postID > b.postID) {
      return -1;
    }
    if (a.postID < b.postID) {
      return 1;
    }
    return 0;
  }
  allPosts.sort(compare);

  if (allPosts.length === 0) {
    res.json([allPosts]);
    return;
  }

  const allLikesIds = [];
  const allReferencePostsIds = [];

  for (let i = 0; i < allPosts.length; i++) {
    allLikesIds.push(allPosts[i].postID);
    const postComments = await Comment.find({
      postID: allPosts[i].postID,
    }).limit(3);
    allPosts[i].comments.push(...postComments);

    if (allPosts[i].comments.length > 0) {
      for (let j = 0; j < allPosts[i].comments.length; j++) {
        console.log(allPosts[i].comments[j]);
        if (allPosts[i].comments[j].commenterID) {
          allPosts[i].comments[j].commenter = await User.findOne({
            googleID: allPosts[i].comments[j].commenterID,
          });
        }
      }
    }

    if (allPosts[i].referencePostID) {
      allReferencePostsIds.push(allPosts[i].referencePostID);
    }
  }

  //ADDING LIKES

  const likes = await Like.find({ postID: allLikesIds });
  allPosts.forEach((post) => {
    const likesToPush = likes.filter((like) => post.postID === like?.postID);
    post.likes.push(...likesToPush);
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
