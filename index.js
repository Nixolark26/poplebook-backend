//import package

const express = require("express");
require("dotenv").config();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

//execute the packagec

const port = process.env.PORT || 5000;

const app = express();
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

const frontURL = "https://poplebook.netlify.app";

const whiteList = ["http://localhost:3000", "https://poplebook.netlify.app"];
const corsOptions = {
  credentials: true,
  origin: whiteList,
};

//middlewarres

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(bodyParser.json({ limit: "25mb" }));

app.use((req, res, next) => {
  const isRegisterEndpoint =
    req.url === "/auth/google" || req.url.includes("/auth/google/redirect");

  if (isRegisterEndpoint) {
    next();
    return;
  }

  const googleID = req?.cookies?.googleId;
  if (!googleID) return res.status(401).json({ message: "Unauthorized" });
  next();
});

//

const User = require("./models/User");
const CookieSession = require("cookie-session");
const Friend = require("./models/Friend");
const Notification = require("./models/Notification");

app.use(
  CookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SECRET],
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "707227266932-ptmb3m7cc6m6ho8u08ai2fiv3s46fe42.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "https://poplebook-back.onrender.com/auth/google/redirect",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleID: profile.id },
        { name: profile.displayName },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

app.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  async function (req, res) {
    console.log(req.user);
    res.cookie("googleId", req.user.googleID, {
      secure: true,
      sameSite: "none",
      maxAge: 900000,
      httpOnly: true,
    });

    const friend = new Friend({
      requesterID: "116241364543005737767",
      addresseeID: req.user.googleID,
      request: false,
    });
    const notification = new Notification({
      senderID: "116241364543005737767",
      addresseeID: req.user.googleID,
      type: "Friendship",
      notificationID: Date.now(),
      viewed: false,
      path: "116241364543005737767",
    });
    const existingRequest = await Friend.findOne({
      requesterID: "116241364543005737767",
      addresseeID: req.user.googleID,
      request: false,
    });
    console.log("request : ", existingRequest);
    if (!existingRequest) {
      friend.save();
      notification.save();
    }

    console.log("cookies", req.cookies);
    res.redirect(frontURL);
    res.send("nice");
  }
);

app.get("/auth/logout", function (req, res, next) {
  req.session = null;
  res.clearCookie("googleId");
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect(frontURL);
});

//

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
