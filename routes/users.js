const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const Notification = require("../models/Notification");
const Friend = require("../models/Friend");
router.post("/", async (req, res) => {
  console.log("creando");
  const user = new User({
    name: req.body.name,
    googleID: req.body.googleID,
    creationTime: req.body.creationTime,
    lastSignInTime: req.body.lastSignInTime,
    photoURL: req.body.photoURL,
  });

  try {
    const userFinded = await User.findOne({ googleID: user.googleID }).exec();

    if (!userFinded) {
      user.save();
      res.status(200).json(user);
    }

    res.status(200).json(userFinded);
  } catch (error) {
    console.log(error.message);
  }
});

//get CurrentUser

router.get("/search/:userId", async (req, res) => {
  try {
    // console.log("searching");
    const name = req.params.userId;
    const user = await User.find({
      name: { $regex: new RegExp(name, "i") },
    }).exec();
    // console.log(user);
    res.json(user);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/", async (req, res) => {
  const googleID = req.cookies.googleId;

  console.log("googleID " + googleID);

  const user = await User.findOne({ googleID });

  //
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

  //
  const notifications = await Notification.find({
    addresseeID: googleID,
  });
  notifications.map((notification) => {
    const notificationUser = friendsDataJSON.find(
      (friend) => notification.friendID === friend.senderID
    );
    notification.name = notificationUser.name;
    notification.photoURL = notificationUser.photoURL;
  });

  console.log("lalala");
  try {
    res.json([user, notifications, friendsDataJSON]);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const removedUser = await User.deleteOne({ _id: req.params.userId });
    res.json(removedUser);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.patch("/", async (req, res) => {
  const profileImage = req.body.photoURL;
  const coverProfile = req.body.coverURL;
  const nameProfile = req.body.name;

  if (profileImage && nameProfile && coverProfile) {
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "Profile-Photo-Images",
    });
    const resultCover = await cloudinary.uploader.upload(coverProfile, {
      folder: "Profile-Cover-Images",
    });

    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        {
          $set: {
            photoURL: result.secure_url,
            name: nameProfile,
            coverURL: resultCover.secure_url,
          },
        }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (profileImage && coverProfile) {
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "Profile-Photo-Images",
    });
    const resultCover = await cloudinary.uploader.upload(coverProfile, {
      folder: "Profile-Cover-Images",
    });

    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        {
          $set: {
            photoURL: result.secure_url,
            coverURL: resultCover.secure_url,
          },
        }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (nameProfile && coverProfile) {
    const resultCover = await cloudinary.uploader.upload(coverProfile, {
      folder: "Profile-Cover-Images",
    });

    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        {
          $set: {
            name: nameProfile,
            coverURL: resultCover.secure_url,
          },
        }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (profileImage && nameProfile) {
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "Profile-Photo-Images",
    });

    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        { $set: { photoURL: result.secure_url, name: nameProfile } }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (coverProfile) {
    const result = await cloudinary.uploader.upload(coverProfile, {
      folder: "Profile-Cover-Images",
    });
    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        { $set: { coverURL: result.secure_url } }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (nameProfile) {
    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        { $set: { name: nameProfile } }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  } else if (profileImage) {
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "Profile-Photo-Images",
    });
    // console.log(result);
    try {
      const updateUser = await User.updateOne(
        { googleID: req.cookies.googleId },
        { $set: { photoURL: result.secure_url } }
      );
      console.log(updateUser);
      res.json(updateUser);
    } catch (error) {
      res.json({ message: error });
    }
  }
});
module.exports = router;

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
