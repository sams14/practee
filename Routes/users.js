const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Slot = require("../models/Slots");
const { forgotPassword, varifyToken } = require("../utils/password");
const { getAvailableSlots } = require("../utils/FindSlots");
const {
  userAuth,
  userLogin,
  checkRole,
  checkLogin,
  userRegister,
  serializeUser
} = require("../utils/Auth");

//___________________________________________________________________________
// Users Registeration Route
//---------------------------------------------------------------------------
router.get('/register-user', async (req, res) => {
  res.render('pages/create-account');
});
router.post("/register-user", checkLogin, async (req, res, next) => {
  await userRegister(req.body, "user", res).then((result)=>{
    result.success ? next() : res.render('pages/create-account',{ response : 
      {
        message: "Unable to create your account",
        success: false
      }
    });
  });
  },userLogin("user"), (req,res) => {
    req.user.newUser = true; 
    res.redirect(303,'/profile');
});

//___________________________________________________________________________
// Admin Registration Route
//---------------------------------------------------------------------------
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

//___________________________________________________________________________
// Super Admin Registration Route
//---------------------------------------------------------------------------
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

//___________________________________________________________________________
// Users Login Route
//---------------------------------------------------------------------------
router.get('/login-user',checkLogin , async (req, res) => {
    return res.redirect(303,'/login-admin');
    // if(Object.keys(req.query).length !== 0){
    //   const response = { message : req.query.message, success : req.query.success==="false"? false : true};
    //   res.render('pages/login',{role : "user", response : response});
    // }
    // else res.render('pages/login',{role : "user"});
});

router.post('/login-user', userLogin("user"),
  function(req, res) {
    res.redirect(303,'/profile');
});

//___________________________________________________________________________
// Admin Login Route
//---------------------------------------------------------------------------
router.get('/login-admin',checkLogin , async (req, res) => {
  if(Object.keys(req.query).length !== 0){
    const response = { message : req.query.message, success : req.query.success==="false"? false : true};
    return res.render('pages/login',{role : "admin", response : response});
  }
  return res.render('pages/login',{role : "admin"});
});
router.post("/login-admin", userLogin("admin"),
  function(req, res) {
    res.redirect(303,'/profile');
});

//___________________________________________________________________________
// Super Admin Login Route
//---------------------------------------------------------------------------
router.get('/login-super-admin',checkLogin , async (req, res) => {
  return res.redirect(303,'/login-admin');
  // if(Object.keys(req.query).length !== 0){
  //   const response = { message : req.query.message, success : req.query.success==="false"? false : true};
  //   res.render('pages/login',{role : "super-admin", response : response});
  // }
  // res.render('pages/login',{role : "super-admin"});
});
router.post("/login-super-admin", userLogin("super-admin"),
  function(req, res) {
    res.redirect(303,'/profile');
});

//___________________________________________________________________________
// Forgot Password Route
//---------------------------------------------------------------------------
router.get('/forgot-password',checkLogin , async (req, res) => {
  res.render('pages/forgot-password');
});
router.put("/forgot-password", forgotPassword);

//___________________________________________________________________________
// Reset Password Route
//---------------------------------------------------------------------------
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

//___________________________________________________________________________
// Profile Route
//---------------------------------------------------------------------------
router.get("/profile", userAuth, checkRole(["admin"]), async (req, res) => {
  var mentorNames = new Set();
  var regionalLang = new Set();
  await Mentor.find({}, async(err, foundData) => {
    if (err) {
        console.log(err);
        return res.status(500).send();
    } else {
        if (foundData.length != 0) {
          foundData.forEach(mentor => {
            mentorNames.add(mentor.name);
            mentor.regionalLang.forEach(lang => {
              regionalLang.add(lang);
            });
          });
        }
      if (!req.query.date){
        return res.render("sales/index", {data:"", searchData:"", mentors: mentorNames, lang: regionalLang});
      }
      else {
        await getAvailableSlots(req, res, mentorNames, regionalLang);
      }
    }
  });
});


//___________________________________________________________________________
// Update Mentor Route
//---------------------------------------------------------------------------
router.get("/mentor", userAuth, checkRole(["admin"]), async (req, res) => {
  Mentor.find({}, async(err, mentors) => {
    if (err) {
        console.log(err);
        return res.status(500).send();
    } else {
        if (mentors.length == 0) {
          return res.render("sales/mentor", { mentors: '' });
        } else {
          return res.render("sales/mentor", { mentors: mentors });
        }
    }
});
});

//___________________________________________________________________________
// Add Mentor Route
//---------------------------------------------------------------------------
router.post("/profile/new-mentor", async(req, res) => {
  const newMentor = new Mentor({
    name: req.body.name,
    email: req.body.email,
    zoomID: req.body.zoomID,
    gender: req.body.gender,
    regionalLang: req.body.regionalLang,
    workingHour: req.body.workingHour,
    breakHours: req.body.breakHours
  });
  Mentor.find({ "email": req.body.email }, async(err, foundData) => {
      if (err) {
          console.log(err);
          return res.status(500).send();
      } else {
          if (foundData.length == 0) {
              var responseObj = "";
              var saveStu = await newMentor.save();
          } else {
              var responseObj = foundData;
          }
      }
      return res.send("Success!!!");
  });
});

router.post("/profile/updateMentor", async(req, res) => {
  console.log(req.body);
  updatedMentor = {
    name: req.body.name,
    gender: req.body.gender,
    regionalLang: req.body.regionalLang.split(","),
    workingHour: req.body.workingHour,
    breakHours: req.body.breakHours.split(",")
  }
  Mentor.updateOne({ _id: req.body._id }, updatedMentor, function(err, results) {
    if (err) return console.log(err);
    else {
      return res.redirect(303,`/mentor`);
    }
  });
});


router.post("/profile/new-slot", async(req, res) => {
  const newSlot = new Slot({
    email: req.body.email,
    zoomID: req.body.zoomID,
    T8: req.body.T8
  });
  Slot.find({ "zoomID": req.body.zoomID }, async(err, foundData) => {
      if (err) {
          console.log(err);
          return res.status(500).send();
      } else {
          if (foundData.length == 0) {
              var responseObj = "";
              var saveStu = await newSlot.save();
          } else {
              var responseObj = foundData;
          }
      }
      return res.send("Success!!!");
  }); 
});

//___________________________________________________________________________
// Users Protected Route
//---------------------------------------------------------------------------
router.get(
  "/user-protectd",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);

//___________________________________________________________________________
// Admin Protected Route
//---------------------------------------------------------------------------
router.get(
  "/admin-protectd",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

//___________________________________________________________________________
// Super Admin Protected Route
//---------------------------------------------------------------------------
router.get(
  "/super-admin-protectd",
  userAuth,
  checkRole(["superadmin"]),
  async (req, res) => {
    return res.json("Hello Super Admin");
  }
);

//___________________________________________________________________________
// Super Admin Protected Route
//---------------------------------------------------------------------------
router.get(
  "/super-admin-and-admin-protectd",
  userAuth,
  checkRole(["superadmin", "admin"]),
  async (req, res) => {
    return res.json("Super admin and Admin");
  }
);

//___________________________________________________________________________
//logout Route
//---------------------------------------------------------------------------
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




