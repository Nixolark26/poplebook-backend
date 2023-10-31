const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");

const cloudinary = require("../utils/cloudinary");

router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/uploads", async (req, res) => {
  const image = req.body.myFile;
  console.log(image);

  const result = await cloudinary.uploader.upload(image, {
    folder: "postPhotos",
    // width: 300,
    // crop: "scale",
  });

  console.log(result);

  try {
    const newImage = await Photo.create({
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    newImage.save();
    res.status(201).json({ msg: "New image uploading..." });
  } catch (error) {
    res.status(409).json({ message: error.message });
    console.log(error);
  }
});

//get CurrentUser

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ googleID: req.params.userId });
    res.json(user);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const removedUser = await User.deleteOne({ _id: req.params.postId });
    res.json(removedUser);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

router.patch("/:postId", async (req, res) => {
  try {
    const updateUser = await User.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title } }
    );
    res.json(updateUser);
  } catch (error) {
    res.json({ message: error });
  }
});
module.exports = router;
