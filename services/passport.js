const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  //id是MongoDB中给每条record自动加的_id，而不是googleId，因为可能有多种登录方式
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      return done(null, user);
    })
})

const gStrategy = new GoogleStrategy(
  {
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: "/auth/google/callback",
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id })
      .then(existUser => {
        if (existUser) {
          return done(null, existUser);
        } else {
          new User({ googleId: profile.id })
            .save()
            .then(user => {
              return done(null, user);
            })
        }
      })
  }
);

passport.use(gStrategy);
