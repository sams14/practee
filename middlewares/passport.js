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

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
	  passReqToCallback: true
    },
    function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne({ email: email }, function (err, user) {
          console.log("within local strategy", user);
          if (err) {
            console.log("Error:", err);
            return done(err);
          }
          // First Check if the email is in the database
          if (!user) {
            console.log("Incorrect username:");
            return done(null, false, { message: "Incorrect username." });
          }
          // Now check for the password
		  bcrypt.compare(password, user.password, function(err,isMatch){
			if (!isMatch) {
				return done(null, false, { message: "Incorrect password." });
			}
			return done(null, user);
		  });
        });
      });
    }
  )
);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

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
