const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { SECRET } = require("../config/index");

/**
 * @DESC To register the user (ADMIN, SUPER_ADMIN, USER)
 */
const userRegister = async(userDets, role, res) => {
    try {

        // validate the email
        let emailNotRegistered = await validateEmail(userDets.email);
        if (!emailNotRegistered) {
            return res.render('pages/create-account',{ response : 
                {
                  message: `Email is already registered`,
                  success: false
                }
            });
        }

        // Get the hashed password
        const password = await bcrypt.hash(userDets.password, 12);
        // create a new user
        const newUser = new User({
            ...userDets,
            password,
            role
        });

        await newUser.save();
        
        return {
            message: "Hurry! now you are successfully registred. Please nor login.",
            success: true
        };
    } catch (err) {
        // Implement logger function (morgon)
        return res.render('pages/create-account',{ response : 
            {
              message: `Unable to create your account`,
              success: false
            }
        });
    }
};

/**
 * @DESC Api Login for the user (ADMIN, SUPER_ADMIN, USER) and generates the access token
 */
const apiLogin = async(userCreds, role, res) => {

    let { email, password } = userCreds;

    // First Check if the email is in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            message: "Email is not found. Invalid login credentials.",
            success: false
        });
    }
    // We will check the role
    if (user.role !== role) {
        return res.status(403).json({
            message: "Please make sure you are logging in from the right portal.",
            success: false
        });
    }
    // That means user is existing and trying to signin fro the right portal
    // Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        // Sign in the token and issue it to the user
        let token = jwt.sign({
                user_id: user._id,
                role: user.role,
                email: user.email
            },
            SECRET, { expiresIn: "7 days" }
        );

        let result = {
            name: user.name,
            role: user.role,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168
        };

        return res.status(200).json({
            ...result,
            message: "Hurray! You are now logged in.",
            success: true
        });
    } else {
        return res.status(403).json({
            message: "Incorrect password.",
            success: false
        });
    }
};

/**
 * @DESC To Login the user (ADMIN, SUPER_ADMIN, USER)
 */
const userLogin = role => async (req, res, next) => {
    await passport.authenticate('local', 
      async (err, user, info) => {
        var message;
        if (info) { 
            return res.redirect(303, '/login-'+role+'/?success='+false+'&message='+info.message); 
        }
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            message = "This Email-Id Hasn't Been Registered Yet !! Please Create An Account";
            return res.redirect(303, '/login-'+role+'/?success='+false+'&message='+message);
        }
        if (role != user.role) { 
            message = "Please Make Sure You Are Logging In From The Right Portal";
            return res.redirect(303, '/login-'+role+'/?success='+false+'&message='+message);
        }
        await req.login(user, (error) => {
            if (error) { return res.send(error) }
            next();
        })
      })(req, res, next);
}

/**
 * @DESC To authenticate logged-in user middleware
 */
const userAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect(303,'/login-user');
    }
}

/**
 * @DESC Passport api authentication middleware
 */
const apiAuth = passport.authenticate("jwt", { session: false });

/**
 * @DESC Check User Role Middleware
 */
const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role) ?
    res.status(401).json("Unauthorized") :
    next();

/**
 * @DESC To authenticate logged-out user middleware
 */
const checkLogin = (req,res,next) => {
    if(req.isAuthenticated()) {
      return res.redirect(303, '/profile');
    }
    else {
      next();
    }
  }

/**
 * @RETURN {boolean} 
 * @True Email Has Not Been Registered !! 
 * @false Email Has Been Registered !!
 */ 
const validateEmail = async email => {
    let user = await User.findOne({ email });
    return user ? false : true;
};

/**
 * @DESC Extract Logged in user Middleware
 */
const serializeUser = user => {
    return {
        email: user.email,
        name: user.name,
        _id: user._id,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    };
};

module.exports = {
    apiAuth,
    userAuth,
    checkRole,
    checkLogin,
    userLogin,
    userRegister,
    apiLogin,
    serializeUser
};