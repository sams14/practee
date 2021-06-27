const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { forgotPassword, varifyToken } = require("../utils/password");
const {
  userAuth,
  userLogin,
  checkRole,
  checkLogin,
  userRegister,
  serializeUser
} = require("../utils/Auth");

// Users Registeration Route
router.get('/register-user', async (req, res) => {
  res.render('pages/create-account');
});
router.post("/register-user", checkLogin, async (req, res, next) => {
  await userRegister(req.body, "user", res).then((result)=>{
    result.success ? next() : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
  },userLogin("user"), (req,res) => {
    req.user.newUser = true; 
    res.redirect(303,'/profile');
});

// Admin Registration Route
router.post("/register-admin", checkLogin, checkRole(["superadmin"]), async (req, res, next) => {
  await userRegister(req.body, "admin", res).then((result)=>{
    result.success ? next() : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
  }, (req,res) => {
    res.redirect(303,'/profile');
});

// Super Admin Registration Route
router.post("/register-super-admin", checkLogin, checkRole(["superadmin"]), async (req, res, next) => {
  await userRegister(req.body, "superadmin", res).then((result)=>{
    result.success ? next() : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
  }, (req,res) => {
    res.redirect(303,'/profile');
});


// Users Login Route
router.get('/login-user',checkLogin , async (req, res) => {
    res.render('pages/login',{role : "user"});
});

router.post('/login-user', userLogin("user"),
  function(req, res) {
    res.redirect(303,'/profile');
});

// Admin Login Route
router.get('/login-admin',checkLogin , async (req, res) => {
  res.render('pages/login',{role : "admin"});
});
router.post("/login-admin", userLogin("admin"),
  function(req, res) {
    res.redirect(303,'/profile');
});

// Super Admin Login Route
router.get('/login-super-admin',checkLogin , async (req, res) => {
  res.render('pages/login',{role : "super-admin"});
});
router.post("/login-super-admin", userLogin("super-admin"),
  function(req, res) {
    res.redirect(303,'/profile');
});

// Forgot Password Route
router.get('/forgot-password',checkLogin , async (req, res) => {
  res.render('pages/forgot-password');
});
router.put("/forgot-password", forgotPassword);

// Reset Password Route
router.get('/reset-password/:token', varifyToken, async (req, res) => {
  res.render('pages/reset-password');
});
router.put('/reset-password/:token', varifyToken, async (req, res) => {
  const { password } = req.body;
  let isMatch = await bcrypt.compare(password, req.user.password);
  if (isMatch) {
    return res.status(500).json({
      message: "This is one of the passwords you've previously used !! PLEASE ENTER A NEW ONE",
      success: false
    });
  } else {
    // Get the hashed password
    const newPassword = await bcrypt.hash(password, 12);
    await User.updateOne({ _id : req.user._id }, { password : newPassword },(err,success) => {
      if (err) {
        return res.status(500).json({
            message: "Unable to update your password.",
            success: false
        });
      } else {
          return res.status(200).json({
            message: "Your password has been updated !! Kindly Login",
            success: true
        });
      }
    })
  }
});


// Profile Route
router.get("/profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

// Users Protected Route
router.get(
  "/user-protectd",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);

// Admin Protected Route
router.get(
  "/admin-protectd",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

// Super Admin Protected Route
router.get(
  "/super-admin-protectd",
  userAuth,
  checkRole(["superadmin"]),
  async (req, res) => {
    return res.json("Hello Super Admin");
  }
);

// Super Admin Protected Route
router.get(
  "/super-admin-and-admin-protectd",
  userAuth,
  checkRole(["superadmin", "admin"]),
  async (req, res) => {
    return res.json("Super admin and Admin");
  }
);

//logout Route
router.get('/logout',userAuth, function (req, res) {
  const role = req.user.role;
  req.logOut();
  res.status(200).clearCookie('connect.sid', {
    path: '/'
  });
  req.session.destroy(function (err) {
    res.redirect(303,'/login-' + role);
  });
});


module.exports = router;
