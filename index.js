const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const adminRouter = require("./routes/adminRoute");
const userRouter = require("./routes/userRoute");
const db = require("./config/db");
const nocache = require("nocache");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const User = require("./models/userModel");
const auth = require("./middleware/userAuth");

const userController = require("./controller/userController");

//passport
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use(nocache());

//setting session
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
  })
);

//passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Serving static files.
app.use("/static", express.static(path.join(__dirname, "public")));

//mounting routes
app.use("/admin", adminRouter);
app.use("/", userRouter);



//passport
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.get("/auth/googleSuccess", userController.googleSuccess);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/googleSuccess",
    failureRedirect: "/signin",
  })
);

app.get("/auth/destroy-otp", (req, res) => {
  delete req.session.otp;
  res.status(200).json({ message: "OTP destroyed" });
});

app.get('*', (req, res) => {

    res.render("user/forNotFor")
  
  });

const port = process.env.PORT  

app.listen(port, () => {
  console.log("Server has started");
});
