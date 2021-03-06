const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Slot = require("../models/Slots");
const { forgotPassword, varifyToken } = require("../utils/password");
const {
  userAuth,
  userLogin,
  checkRole,
  checkLogin,
  userRegister,
  serializeUser
} = require("../utils/Auth");
const Slots = require("../models/Slots");

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
    if(Object.keys(req.query).length !== 0){
      const response = { message : req.query.message, success : req.query.success==="false"? false : true};
      res.render('pages/login',{role : "user", response : response});
    }
    else res.render('pages/login',{role : "user"});
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
    res.render('pages/login',{role : "admin", response : response});
  }
  res.render('pages/login',{role : "admin"});
});
router.post("/login-admin", userLogin("admin"),
  function(req, res) {
    res.redirect(303,'/profile');
});

//___________________________________________________________________________
// Super Admin Login Route
//---------------------------------------------------------------------------
router.get('/login-super-admin',checkLogin , async (req, res) => {
  if(Object.keys(req.query).length !== 0){
    const response = { message : req.query.message, success : req.query.success==="false"? false : true};
    res.render('pages/login',{role : "super-admin", response : response});
  }
  res.render('pages/login',{role : "super-admin"});
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
router.get("/profile", userAuth, async (req, res) => {
  // return res.json(serializeUser(req.user));
  res.render("sales/index");
});

function checkSlot(newSlotST, newSlotET, bookedSlots, breakHours){
  bookedSlots.forEach(bS => {
    // console.log(newSlotET<=bS);
    if(newSlotET <= bS){
      breakHours.forEach(bH => {
        var bH0 = new Date(bH.split("-")[0]);
        var bH1 = new Date(bH.split("-")[1]);
        // console.log(bH0, bH1);
        if(newSlotET > bH0 && newSlotET < bH1){
          return bH1; 
        }
      });
      return 0;
    } else {
      console.log(bS.split("-")[1]);
      return Date(bS.split("-")[1]);
    }
  });
}
router.post("/profile", userAuth, async (req, res) => {
  Mentor.find({ "gender": req.body.gender, "regionalLang": req.body.lang }, async(err, foundData) => {
      if (err) {
          console.log(err);
          return res.status(500).send();
      } else {
          if (foundData.length == 0) {
            return res.status(500).send();
          } else {
            var responseObj = foundData;
            responseObj.forEach(mentor => {
              Slot.findOne({"zoomID": mentor.zoomID}, async(err, foundData) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send();
                } else {
                     if (foundData.length == 0) {
                       return res.status(500).send();
                     } else {
                        var slotObj = foundData;
                        var bookedSlots = [];
                        slotObj.T8.forEach(slot => {
                          var GMT = new Date(slot.start_time);              
                          var startTime = GMT.toLocaleString(undefined, {timeZone: 'Asia/Kolkata', hour12: false}).split(", ")[1];
                          GMT.setMinutes(GMT.getMinutes() + slot.duration);
                          var endTime = GMT.toLocaleString(undefined, {timeZone: 'Asia/Kolkata', hour12: false}).split(", ")[1];
                          startTime = new Date(Date.parse(req.body.date + " " + startTime));
                          endTime = new Date(Date.parse(req.body.date + " " + endTime));
                          var time = (startTime + "-" + endTime);
                          bookedSlots.push(time);
                       });
                       mentor.breakHours.forEach((bh, i) => {
                         mentor.breakHours[i] = new Date(Date.parse(req.body.date + "-" + bh.split("-")[0])) + new Date(Date.parse(req.body.date + " " + bh.split("-")[1]));
                       });
                       var availableSlots = [];
                       var newSlotST = new Date(Date.parse(req.body.date + " " + mentor.workingHour.split("-")[0]));
                       var eTime = new Date(Date.parse(req.body.date + " " + mentor.workingHour.split("-")[1]));
                       eTime.setMinutes(eTime.getMinutes()-30);
                       while(newSlotST<=eTime){
                        var newSlotET = new Date(newSlotST);
                        newSlotET.setMinutes(newSlotET.getMinutes()+30);
                        if(!checkSlot(newSlotST, newSlotET, bookedSlots, mentor.breakHours)){
                          availableSlots.push(newSlotST + "-" + newSlotET);
                          newSlotST = newSlotET;
                        } else {
                          newSlotST = checkSlot(newSlotST, newSlotET, bookedSlots, mentor.breakHours);
                        }
                       }
                     }
                    //  console.log(availableSlots);
                     res.render("sales/index");
                     // res.redirect(303, "/profile", {availableSlots: availableSlots})
                  }
              });
            });
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
