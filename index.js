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

const corsOptions = {
  credentials: true,
  origin: "http://localhost:3000",
};
const frontURL = "https://poplebook.netlify.app/";

//middlewarres

app.use(cors());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "25mb" }));

app.use((req, res, next) => {
  console.log(req.cookies);
  console.log(req.url);
  const isRegisterEndpoint =
    req.url === "/auth/google" || req.url.includes("/auth/google/redirect");

  console.log();
  if (isRegisterEndpoint) {
    console.log("next");
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
        {
          googleID: profile.id,
          name: profile.displayName,
          photoURL:
            "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg",
        },
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
  function (req, res) {
    console.log(req.user);
    res.cookie("googleId", req.user.googleID, {
      secure: true,
      sameSite: "none",
    });
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
    // res.send(req.user.displayName);
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
