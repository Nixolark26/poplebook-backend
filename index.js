//import package

const express = require("express");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//execute the packagec

const port = process.env.PORT || 5000;

const app = express();
require("dotenv/config");
//import routes

const postsRoute = require("./routes/posts");
const usersRoute = require("./routes/users");
const friendsRoute = require("./routes/friends");
const messagesRoute = require("./routes/messages");
const feedRoute = require("./routes/feed");
const likesRoute = require("./routes/likes");
const commentsRoute = require("./routes/comments");
const photosRoute = require("./routes/photos");
const impressionsRoute = require("./routes/impressions");
const notificationsRoute = require("./routes/notifications");

const whiteList = [
  "https://poplebook.netlify.app",
  "http://localhost:3000",
  "https://654946da92bb6b37d9b8afd7--serene-taffy-8d0ac4.netlify.app",
  "https://65495c8e48509b0087fbf3c9--storied-pavlova-88e151.netlify.app",
  "https://6549537d8aef3357d5f97def--super-cendol-7f7241.netlify.app",
  "https://654a4a9f1aa1093748a91cc7--cheerful-kashata-d27ea7.netlify.app",
  "https://654a49a371ad243616ea1599--stupendous-cat-edfc31.netlify.app",
];
const corsOptions = {
  credentials: true,
  origin: whiteList,
};

//middlewarres

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "25mb" }));

app.use((req, res, next) => {
  const isRegisterEndpoint = req.url === "/users" && req.method === "POST";
  if (isRegisterEndpoint) {
    next();
    return;
  }
  console.log(req.cookies);

  const googleID = req?.cookies?.googleId;
  if (!googleID) return res.status(401).json({ message: "Unauthorized" });
  next();
});

app.use("/users", usersRoute);
app.use("/posts", postsRoute);
app.use("/friends", friendsRoute);
app.use("/messages", messagesRoute);
app.use("/feed", feedRoute);
app.use("/likes", likesRoute);
app.use("/comments", commentsRoute);
app.use("/photos", photosRoute);
app.use("/impressions", impressionsRoute);
app.use("/notifications", notificationsRoute);

//create endpoints/routes

app.get("/", (req, res) => {
  res.send("We are on HOME");
});

//connect to DB

mongoose.connect(process.env.DB_CONNECTION);

//how to we start listening to the server
app.listen(port);
