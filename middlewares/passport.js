const passport = require("passport");
const User = require("../models/User");
const { SECRET } = require("../config/index");
const { Strategy, ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

//___________________________________________________________________________
//User Login Authentication Strategy Middleware
//---------------------------------------------------------------------------
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne({ email: email }, function (err, user) {

          if (err) {
            return done(err);
          }
          // First Check if the email is in the database
          if (!user) {
            return done(null, false, { message: "This Email-Id Hasn't Been Registered Yet !! Please Create An Account" });
          }
          // Now check for the password
          bcrypt.compare(password, user.password, function (err, isMatch) {
            if (!isMatch) {
              return done(null, false, { message: "Invalid Credentials !! Either The Email-Id Or The Password Is In Correct" });
            }
            return done(null, user);
          });
        });
      });
    }
  )
);

// Middleware to serialize the user while login
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Middleware to deserialize the user while logout
passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//___________________________________________________________________________
//Api Authentication Strategy Middleware
//---------------------------------------------------------------------------
passport.use(
  new Strategy(opts, async (payload, done) => {
    await User.findById(payload.user_id)
      .then((user) => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);
