const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");

const cloudinary = require("../utils/cloudinary");
const Notification = require("../models/Notification");

router.post("/", async (req, res) => {
  const message = new Message({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    content: req.body.content,
    date: req.body.date,
    id: req.body.id,
  });

  const notification = new Notification({
    senderID: req.cookies.googleId,
    addresseeID: req.body.addresseeID,
    type: "Message",
    path: "messages/" + req.cookies.googleId,
    viewed: false,
    notificationID: Date.now(),
  });

  const isThereNotification = await Notification.findOne({
    path: notification.path,
    addresseeID: req.body.addresseeID,
  });

  if (req.body.image) {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "Messages-Images",
    });
    message.image = result.secure_url;
  }

  message.save();

  res.json(message);

  if (isThereNotification) {
    const updateNotification = await Notification.updateOne(
      { path: notification.path, addresseeID: req.body.addresseeID },
      { $set: { notificationID: notification.notificationID, viewed: false } }
    );
    console.log(updateNotification);
    console.log("no saving");
    return;
  } else {
    notification.save();
    console.log("saving");
  }

  try {
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/:MessageId", async (req, res) => {
  let params = req.params.MessageId.split("-");
  console.log(params[0]);
  // DELETING NOTIFICATION
  const removedNotification = await Notification.deleteOne({
    addresseeID: req.cookies.googleId,
    senderID: params[0],
    type: "Message",
  });

  // console.log(removedNotification);
  //
  try {
    const sender = await User.findOne({ googleID: req.cookies.googleId });
    const addressee = await User.findOne({ googleID: params[0] });
    const currentPage = params[1];
    let skip = (currentPage - 1) * 15;
    let limit = 15;

    // console.log("skip", skip);
    // console.log("limit", limit);

    const currentMessages = await Message.find({
      $or: [
        {
          senderID: params[0],
          addresseeID: req.cookies.googleId,
        },
        {
          senderID: req.cookies.googleId,
          addresseeID: params[0],
        },
      ],
    })
      .sort({ date: "desc" })
      .skip(skip)
      .limit(limit);

    currentMessages.forEach((message) => {
      if (message.senderID === sender.googleID) {
        message.sender = sender;
      } else {
        message.addressee = sender;
      }
      if (message.addresseeID === addressee.googleID) {
        message.addressee = addressee;
      } else {
        message.sender = addressee;
      }
      message.date = message.date;
    });
    res.json([addressee, currentMessages]);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
