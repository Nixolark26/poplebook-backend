const express = require("express");
const router = express.Router();
const User = require("../models/User");

const Notification = require("../models/Notification");

router.delete("/:NotificationId", async (req, res) => {
  const notificationID = req.params.NotificationId;
  try {
    let removedNotification = await Notification.deleteOne({
      notificationID,
    });
    console.log(removedNotification);
    res.json(removedNotification);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.patch("/", async (req, res) => {
  console.log(req.body);
  try {
    const updatePost = await Notification.updateMany(
      { addresseeID: req.cookies.googleId },
      { $set: { viewed: true } }
    );
    console.log(updatePost);
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
