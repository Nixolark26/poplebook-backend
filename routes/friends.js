const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Friend = require("../models/Friend");
const Notification = require("../models/Notification");

router.post("/", async (req, res) => {
  const friend = new Friend({
    requesterID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    request: false,
  });
  const notification = new Notification({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    type: "Friendship",
    notificationID: Date.now(),
    viewed: false,
    path: req.cookies.googleId,
  });

  const friendExist = await Friend.findOne({
    $or: [
      {
        requesterID: req.cookies.googleId,
        addresseeID: req.body.addresseeID,
        request: null,
      },
      {
        addresseeID: req.cookies.googleId,
        requesterID: req.body.addresseeID,
        request: null,
      },
    ],
  });

  const notificationExist = await Notification.findOne({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    type: "Friendship",
    path: req.cookies.googleId,
  });

  if (friendExist) {
    const updateFriend = await Friend.updateOne(
      {
        $or: [
          {
            addresseeID: req.body.addresseeID,
            requesterID: req.cookies.googleId,
          },
          {
            requesterID: req.body.addresseeID,
            addresseeID: req.cookies.googleId,
          },
        ],
      },
      {
        $set: {
          request: false,
          requesterID: req.cookies.googleId,
          addresseeID: req.body.addresseeID,
        },
      }
    );

    if (notificationExist) {
      const updateNotification = await Notification.updateOne(
        {
          senderID: req.cookies.googleId,
          addresseeID: req.body.addresseeID,
          type: "Friendship",
          path: req.cookies.googleId,
        },
        { $set: { notificationID: Date.now(), viewed: false } }
      );
    } else {
      notification.save();
    }
    res.json(updateFriend);
    return;
  }
  if (notification.addresseeID !== req.cookies.googleId) notification.save();

  try {
    friend.save();
    res.json(friend);
  } catch (error) {
    console.log(error.message);
  }
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

router.get("/my-friends/", async (req, res) => {
  const googleID = req.cookies.googleId;
  try {
    let friends = await Friend.find({
      $or: [{ requesterID: googleID }, { addresseeID: googleID }],
    });

    const friendsIDs = [];
    friends.filter((friend) => {
      if (friend.addresseeID === googleID) friendsIDs.push(friend.requesterID);
      else friendsIDs.push(friend.addresseeID);
    });

    const friendsData = await User.find({ googleID: friendsIDs });
    const friendsDataJSON = friendsData.map((friend) => {
      return (friend = {
        name: friend.name,
        friendID: friend.googleID,
        photoURL: friend.photoURL,
      });
    });
    for (let i = 0; i < friendsDataJSON.length; i++) {
      const friend = friends.find((friend) => {
        return (
          friend.requesterID === friendsDataJSON[i].friendID ||
          friend.addresseeID === friendsDataJSON[i].friendID
        );
      });

      friendsDataJSON[i].request = friend.request;
    }
    res.json(friendsDataJSON);
  } catch (error) {
    res.json({ message: error });
  }
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//RELATIONSHIP
router.get("/:FriendId", async (req, res) => {
  console.log("here");
  const friendId = req.params.FriendId;
  try {
    let friend = await Friend.findOne({
      $or: [
        { addresseeID: friendId, requesterID: req.cookies.googleId },
        {
          requesterID: friendId,
          addresseeID: req.cookies.googleId,
        },
      ],
    });

    const profileFriendsLength = await Friend.count({
      $or: [
        { addresseeID: friendId, request: true },
        { requesterID: friendId, request: true },
      ],
    });

    console.log(friend);
    if (friend) {
      if (friend?.requesterID === req.cookies.googleId) {
        friend = {
          request: friend.request,
          sender: true,
          friendID: friend.addresseeID,
        };
      } else {
        friend = {
          request: friend.request,
          sender: false,
          friendID: friend.requesterID,
        };
      }
    }

    res.json([friend, profileFriendsLength]);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.delete("/:FriendId", async (req, res) => {
  const friendId = req.params.FriendId;
  try {
    let removedFriend = await Friend.deleteOne({
      $or: [
        { addresseeID: friendId, requesterID: req.cookies.googleId },
        {
          requesterID: friendId,
          addresseeID: req.cookies.googleId,
        },
      ],
    });
    console.log(removedFriend);
    res.json(removedFriend);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.patch("/:FriendId", async (req, res) => {
  try {
    const updateFriend = await Friend.updateOne(
      {
        $or: [
          {
            addresseeID: req.params.FriendId,
            requesterID: req.cookies.googleId,
          },
          {
            requesterID: req.params.FriendId,
            addresseeID: req.cookies.googleId,
          },
        ],
      },
      { $set: { request: req.body.request } }
    );

    const notificationExist = await Notification.findOne({
      senderID: req.cookies.googleId,
      addresseeID: req.body.addresseeID,
      type: "Friendship-accepted",
      path: req.cookies.googleId,
    });

    if (req.body.request === true) {
      const notification = new Notification({
        senderID: req.cookies.googleId,
        addresseeID: req.params.FriendId,
        type: "Friendship-accepted",
        notificationID: Date.now(),
        viewed: false,
        path: req.cookies.googleId,
      });

      if (notificationExist) {
        const updateNotification = await Notification.updateOne(
          {
            $or: [
              {
                senderID: req.cookies.googleId,
                addresseeID: req.body.addresseeID,
                type: "Friendship-accepted",
              },
              {
                addresseeID: req.cookies.googleId,
                sender: req.body.addresseeID,
                type: "Friendship-accepted",
              },
            ],
          },
          { $set: { notificationID: Date.now(), viewed: false } }
        );
        console.log(updateNotification);
      } else {
        if (notification.addresseeID !== req.cookies.googleId)
          notification.save();
      }
    }

    res.json(updateFriend);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
