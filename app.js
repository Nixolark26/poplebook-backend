//import package

const express = require("express");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//execute the package

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
const corsOptions = {
  origin: "https://poplebook.netlify.app",
  credentials: true,
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

  const googleID = req?.cookies?.googleId;
  console.log(req.cookies);
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
app.listen(5000);
