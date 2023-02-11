const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const HttpsProxyAgent = require('https-proxy-agent');
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
    callbackURL: "/auth/google/callback"
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
const agent = new HttpsProxyAgent(process.env.HTTP_PROXY || "http://127.0.0.1:7890");
gStrategy._oauth2.setAgent(agent);

passport.use(gStrategy);
