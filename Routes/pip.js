const router = require("express").Router();
const axios = require("axios").default;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const pipForm = require("../models/PIP Form");
const Slot = require("../models/Slots");
const { mailer } = require("../utils/password");
const { forgotPassword, varifyToken } = require("../utils/password");
// const { getAvailableSlots } = require("../utils/FindSlots");
const {
  userAuth,
  userLogin,
  checkRole,
  checkLogin,
  userRegister,
  serializeUser,
} = require("../utils/Auth");

router.get("/pip-form/:id", async (req, res) => {
  await pipForm.findOne({ _id: req.params.id }, function (err, formData) {
    if (err) {
      console.log(err);
      return res.render("pages/404");
    } else {
      if (formData) return res.render("pip-tool/view-form", { formData });
      return res.render("pages/404");
    }
  });
});

router.put("/pip-form/:id", async (req, res) => {
  const formData = await pipForm.findOne({ _id: req.params.id });

  if (formData) {
    console.log(req.body);
    pipForm.updateOne({ _id: req.params.id }, req.body, function (err, result) {
      if (err) {
        return res.status(500).json({
          message: "Failed Updated Your Response",
          success: false,
        });
      } else {
        return res.status(200).json({
          message: "Updated Your Response",
          success: true,
        });
      }
    });
  } else
    return res.status(500).json({
      message: "PIP Form DOesn't Exist",
      success: false,
    });
});

//___________________________________________________________________________
// Users Registeration Route
//---------------------------------------------------------------------------
router.get("/register-user", async (req, res) => {
  res.render("pages/create-account");
});
router.post(
  "/register-user",
  checkLogin,
  async (req, res, next) => {
    await userRegister(req.body, "user", res).then((result) => {
      result.success
        ? next()
        : res.render("pages/create-account", {
            response: {
              message: "Unable to create your account",
              success: false,
            },
          });
    });
  },
  userLogin("user"),
  (req, res) => {
    req.user.newUser = true;
    res.redirect(303, "/utility/profile");
  }
);

//___________________________________________________________________________
// Admin Registration Route
//---------------------------------------------------------------------------
router.post(
  "/register-admin",
  checkLogin,
  checkRole(["superadmin"]),
  async (req, res, next) => {
    await userRegister(req.body, "admin", res).then((result) => {
      result.success
        ? next()
        : res.status(500).json({
            message: "Unable to create your account.",
            success: false,
          });
    });
  },
  (req, res) => {
    res.redirect(303, "/utility/profile");
  }
);

//___________________________________________________________________________
// Super Admin Registration Route
//---------------------------------------------------------------------------
router.post(
  "/register-super-admin",
  checkLogin,
  checkRole(["superadmin"]),
  async (req, res, next) => {
    await userRegister(req.body, "superadmin", res).then((result) => {
      result.success
        ? next()
        : res.status(500).json({
            message: "Unable to create your account.",
            success: false,
          });
    });
  },
  (req, res) => {
    res.redirect(303, "/utility/profile");
  }
);

//___________________________________________________________________________
// Users Login Route
//---------------------------------------------------------------------------
router.get("/login-user", checkLogin, async (req, res) => {
  // return res.redirect(303,'/utility/login-admin');
  if (Object.keys(req.query).length !== 0) {
    const response = {
      message: req.query.message,
      success: req.query.success === "false" ? false : true,
    };
    res.render("pages/login", { role: "user", response: response });
  } else res.render("pages/login", { role: "user" });
});

router.post("/login-user", userLogin("user"), function (req, res) {
  res.redirect(303, "/utility/profile");
});

//___________________________________________________________________________
// Admin Login Route
//---------------------------------------------------------------------------
router.get("/login-admin", checkLogin, async (req, res) => {
  return res.redirect(303, "/utility/login-user");
  // if (Object.keys(req.query).length !== 0) {
  //   const response = {
  //     message: req.query.message,
  //     success: req.query.success === "false" ? false : true,
  //   };
  //   return res.render("pages/login", { role: "admin", response: response });
  // }
  // return res.render("pages/login", { role: "admin" });
});
router.post("/login-admin", userLogin("admin"), function (req, res) {
  res.redirect(303, "/utility/profile");
});

//___________________________________________________________________________
// Super Admin Login Route
//---------------------------------------------------------------------------
router.get("/login-super-admin", checkLogin, async (req, res) => {
  return res.redirect(303, "/utility/login-user");
  // if(Object.keys(req.query).length !== 0){
  //   const response = { message : req.query.message, success : req.query.success==="false"? false : true};
  //   res.render('pages/login',{role : "super-admin", response : response});
  // }
  // res.render('pages/login',{role : "super-admin"});
});
router.post(
  "/login-super-admin",
  userLogin("super-admin"),
  function (req, res) {
    res.redirect(303, "/utility/profile");
  }
);

//___________________________________________________________________________
// Forgot Password Route
//---------------------------------------------------------------------------
router.get("/forgot-password", checkLogin, async (req, res) => {
  res.render("pages/forgot-password");
});
router.post("/forgot-password", forgotPassword);

//___________________________________________________________________________
// Reset Password Route
//---------------------------------------------------------------------------
router.get("/reset-password/:token", varifyToken, async (req, res) => {
  res.render("pages/reset-password");
});
router.put("/reset-password/:token", varifyToken, async (req, res) => {
  const { password } = req.body;
  let isMatch = await bcrypt.compare(password, req.user.password);
  if (isMatch) {
    return res.status(500).json({
      message:
        "This is one of the passwords you've previously used !! PLEASE ENTER A NEW ONE",
      success: false,
    });
  } else {
    // Get the hashed password
    const newPassword = await bcrypt.hash(password, 12);
    await User.updateOne(
      { _id: req.user._id },
      { password: newPassword },
      (err, success) => {
        if (err) {
          return res.status(500).json({
            message: "Unable to update your password.",
            success: false,
          });
        } else {
          return res.status(200).json({
            message: "Your password has been updated !! Kindly Login",
            success: true,
          });
        }
      }
    );
  }
});

//___________________________________________________________________________
// Profile Route
//---------------------------------------------------------------------------
router.get(
  "/profile",
  userAuth,
  checkRole(["admin", "user"]),
  async (req, res) => {
    // console.log(req.user);
    res.render("pip-tool/index", {
      page: "Dashboard",
      loginUserName: req.user.name,
    });
  }
);
router.get(
  "/new-form",
  userAuth,
  checkRole(["admin", "user"]),
  async (req, res) => {
    console.log(req.user);
    var options = {
      method: "GET",
      url: "https://api.zoom.us/v2/users",
      params: { page_size: "50", status: "active" },
      headers: {
        Authorization: "Bearer " + process.env.zoom_token,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        // console.log(response.data.users);
        return res.render("pip-tool/index", {
          page: "New Forms",
          mentors: response.data.users,
        });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send("Failed To Fetch Mentor Details !!");
      });
  }
);

router.post(
  "/new-form",
  userAuth,
  checkRole(["admin", "user"]),
  async (req, res) => {
    console.log(req.body);
    const formData = new pipForm({
      ...req.body,
      pipCreater: req.user.name,
      pipCreaterMail: req.user.email,
    });
    const formInfo = await formData.save();
    console.log(formInfo);

    var mailOptions = {
      from: "practeetechnology@gmail.com",
      to: req.body.email,
      cc: req.user.email,
      subject: "Performance Improvement Plan - Acknowledge Now!",
      html: `
      <h4>Hi Mentor,</h4>
      <br>
      <h4>At Practee, we believe in Continuous Improvement. Below is the link for your performance action plan that your auditor has prepared to help you improve any knowledge gap areas.
      Your auditor must have completed this discussion with you, but we request you to go through this plan & reach out if you have any questions or doubts.</h4>
      <br>
      <h4>Note - As per the process, you are required to acknowledge this plan unless there are any pending discussions with your auditor.</h4>
      <br>
      <h4>Thank you!</h4>
      </h4>Practee Team</h4>
      <br>
      <h4>Click on the link below</h4>
      <h3><a href="${
        process.env.APP_URL + "/utility/pip-form/" + formInfo._id
      }" >Ackownoledge Now!</a><h3>
      `,
    };
    await mailer(mailOptions);
    return res
      .status(200)
      .send("Mail Has been Sent Successfully to " + req.body.mentorMail);
  }
);

router.get(
  "/history",
  userAuth,
  checkRole(["admin", "user"]),
  async (req, res) => {
    await pipForm.find(
      { pipCreaterMail: req.user.email },
      function (err, formData) {
        if (err) {
          console.log(err);
          return res.render("pages/404");
        } else {
          // console.log(formData)
          if (formData) {
            return res.render("pip-tool/index", {
              page: "History",
              formData: formData,
            });
          }
        }
      }
    );
  }
);

//___________________________________________________________________________
// Update Mentor Route
//---------------------------------------------------------------------------
router.get("/mentor", userAuth, checkRole(["admin"]), async (req, res) => {
  Mentor.find({}, async (err, mentors) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    } else {
      if (mentors.length == 0) {
        return res.render("sales/mentor", { mentors: "" });
      } else {
        return res.render("sales/mentor", { mentors: mentors });
      }
    }
  });
});

//___________________________________________________________________________
// Add Mentor Route
//---------------------------------------------------------------------------
router.post("/profile/new-mentor", async (req, res) => {
  const newMentor = new Mentor({
    name: req.body.name,
    email: req.body.email,
    zoomID: req.body.zoomID,
    gender: req.body.gender,
    regionalLang: req.body.regionalLang,
    workingHour: req.body.workingHour,
    breakHours: req.body.breakHours,
  });
  Mentor.find({ email: req.body.email }, async (err, foundData) => {
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

router.post("/profile/updateMentor", async (req, res) => {
  console.log(req.body);
  updatedMentor = {
    name: req.body.name,
    gender: req.body.gender,
    regionalLang: req.body.regionalLang.split(","),
    workingHour: req.body.workingHour,
    breakHours: req.body.breakHours.split(","),
  };
  Mentor.updateOne(
    { _id: req.body._id },
    updatedMentor,
    function (err, results) {
      if (err) return console.log(err);
      else {
        return res.redirect(303, `/utility/mentor`);
      }
    }
  );
});

router.post("/profile/new-slot", async (req, res) => {
  const newSlot = new Slot({
    email: req.body.email,
    zoomID: req.body.zoomID,
    T8: req.body.T8,
  });
  Slot.find({ zoomID: req.body.zoomID }, async (err, foundData) => {
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
router.get("/logout", userAuth, function (req, res) {
  const role = req.user.role;
  req.logOut();
  res.status(200).clearCookie("connect.sid", {
    path: "/",
  });
  req.session.destroy(function (err) {
    res.redirect(303, "/utility/login-" + role);
  });
});

module.exports = router;
