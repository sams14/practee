const router = require("express").Router();

// Bring in the User Registration function
const {
  apiAuth,
  apiLogin,
  checkRole,
  userRegister,
  serializeUser
} = require("../utils/Auth");

// Users Registeration Route
router.post("/register-user", async (req, res) => {
  await userRegister(req.body, "user", res).then((result)=>{
    result.success ? res.status(500).json(result) : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
});

// Admin Registration Route
router.post("/register-admin", async (req, res) => {
  await userRegister(req.body, "admin", res).then((result)=>{
    result.success ? res.status(500).json(result) : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
});

// Super Admin Registration Route
router.post("/register-super-admin", async (req, res) => {
  await userRegister(req.body, "superadmin", res).then((result)=>{
    result.success ? res.status(500).json(result) : res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  });
});

// Users Login Route
router.get('/login-user', async (req, res) => {
  res.render('pages/login',{role : "user"});
});
router.post("/login-user", async (req, res) => {
  await apiLogin(req.body, "user", res);
});

// Admin Login Route
router.get('/login-admin', async (req, res) => {
  res.render('pages/login',{role : "admin"});
});
router.post("/login-admin", async (req, res) => {
  await apiLogin(req.body, "admin", res);
});

// Super Admin Login Route
router.get('/login-super-admin', async (req, res) => {
  res.render('pages/login',{role : "super-admin"});
});
router.post("/login-super-admin", async (req, res) => {
  await apiLogin(req.body, "superadmin", res);
});

// Profile Route
router.get("/profile", apiAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

// Users Protected Route
router.get(
  "/user-protectd",
  apiAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);

// Admin Protected Route
router.get(
  "/admin-protectd",
  apiAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

// Super Admin Protected Route
router.get(
  "/super-admin-protectd",
  apiAuth,
  checkRole(["superadmin"]),
  async (req, res) => {
    return res.json("Hello Super Admin");
  }
);

// Super Admin Protected Route
router.get(
  "/super-admin-and-admin-protectd",
  apiAuth,
  checkRole(["superadmin", "admin"]),
  async (req, res) => {
    return res.json("Super admin and Admin");
  }
);

module.exports = router;
