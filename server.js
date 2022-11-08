const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const uuid = require("uuid").v4;
// const authRoute = require('./Routes/routes');
const cors = require("cors");
const passport = require("passport");
const axios = require("axios");
const { mailer } = require("./utils/password");
const { connect, connection } = require("mongoose");
const { success, error } = require("consola");
const { update_VimeoFolder } = require("./utils/vimeoFolder");
const pipForm = require("./models/PIP Form");
const reminderPipEmail = require("./Email Templates/reminderPipStatus");

// Bring in the app constants
const { ENV, URL, DB, SECRET, PORT } = require("./config/index");

//initialize express.
const app = express();

//Serving ejs files in views folder
app.set("view engine", "ejs");

// Configure morgan module to log all requests.
app.use(morgan("dev"));

// Secure Express app using Helmet Middlewares
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set the front-end folder to serve public assets.
app.use(express.static(path.join(__dirname, "Public")));

app.use(cors());

// Connection With DB
connect(
  DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err) {
    if (err) {
      error({
        message: `Unable to connect with Database \n${err}`,
        badge: true,
      });
    }
  }
);

const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: "sessions",
});

app.use(
  session({
    genid: (req) => {
      return uuid(); // use UUIDs for session IDs
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      secure: ENV == "production" ? true : false,
      httpOnly: true,
      sameSite: true,
    },
  })
);

// Middlewares
require("./middlewares/passport");
app.use(passport.initialize());
app.use(passport.session());

// User Router Middleware
// app.use("/", require("./Routes/users"));
app.use("/practee", require("./Routes/practee"));
app.use("/api/v1", require("./Routes/api"));
app.use("/utility", require("./Routes/pip"));

app.get("/", function (req, res) {
  return res.redirect("/utility/profile");
});

app.get("/review", function (req, res) {
  return res.redirect(
    "https://www.google.com/maps/place/Practee+Technologies/@28.7219995,77.1284577,15z/data=!4m14!1m6!3m5!1s0x0:0xb461098f76fe67d0!2sPractee+Technologies!8m2!3d28.7219995!4d77.1284577!3m6!1s0x0:0xb461098f76fe67d0!8m2!3d28.7219995!4d77.1284577!9m1!1b1"
  );
});

app.get("*", function (req, res) {
  return res.render("pages/404");
});

//Python Job Scheduler
const CronJob = require("cron").CronJob;
const { spawn } = require("child_process");
const zoomRecordingsHandler = new CronJob({
  // Run at 02:30am Indian Standard time, everyday
  cronTime: "30 02 * * *",
  onTick: function () {
    // Run whatever you like here..
    let json_response,
      error = "No Error Found !!";
    const childP = spawn("python", [
      path.resolve("Job Scheduler", "vimeo_uploader.py"),
    ]);
    childP.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    childP.stderr.on("data", (data) => {
      error = data;
    });
    childP.on("close", async (code) => {
      await update_VimeoFolder()
        .then(function (response) {
          // handle success
          json_response = response;
          console.log(json_response);
        })
        .catch(function (err) {
          // handle error
          console.log(err);
        });
      console.log(`Job Scheduler error: ${error}`);
      console.log(`Job Scheduler exited with code: ${code}`);
      var mailOptions = {
        from: "ash2000test@gmail.com",
        to: "asutosh2000ad@gmail.com",
        cc: "sambidbharadwaj@gmail.com",
        subject: "Job Scheduler Status",
        html: `
                <h3>Database Updation</h3>
                <p>Message: ${
                  json_response["message"]
                    ? JSON.stringify(json_response["message"])
                    : "something went wrong !!"
                }</p>
                <p>Failed Folders: ${
                  json_response["failed_folders"]
                    ? JSON.stringify(json_response["failed_folders"])
                    : "something went wrong !!"
                }</p>
                <p>Status: <strong>${
                  json_response["success"]
                    ? JSON.stringify(json_response["success"])
                    : "something went wrong !!"
                }</strong></p>
                <br>
                <h3>Job Scheduler</h3>
                <p>Job Scheduler Status: <strong>${error}</strong></p>
                <p>Job Scheduler Exited With Status Code: <strong>${code}</strong></p>
                `,
      };
      await mailer(mailOptions);
    });
  },
  start: true,
  timeZone: "Asia/Kolkata",
});

const zoomAttendanceReport = new CronJob({
  // Run at 06:00am Indian Standard time, everyday
  cronTime: "00 06 * * *",
  onTick: function () {
    // Run whatever you like here..
    let error = "No Error Found !!";
    const childP = spawn("python", [
      path.resolve("Zoom Attendance", "report_generator.py"),
    ]);
    childP.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    childP.stderr.on("data", (data) => {
      error = data;
    });
    childP.on("close", async (code) => {
      console.log(`Zoom Attendace Report error: ${error}`);
      console.log(`Zoom Attendace Report exited with code: ${code}`);
      if (code) {
        var mailOptions = {
          from: "practeetechnology@gmail.com",
          to: "asutosh2000ad@gmail.com",
          cc: "sambidbharadwaj@gmail.com",
          subject: "Zoom Attendace Report Status",
          html: `
                    <h3>Job Scheduler</h3>
                    <p>Job Scheduler Status: <strong>${error}</strong></p>
                    <p>Job Scheduler Exited With Status Code: <strong>${code}</strong></p>
                    `,
        };
        await mailer(mailOptions);
      }
    });
  },
  start: true,
  timeZone: "Asia/Kolkata",
});

const pipReminderScheduler = new CronJob({
  // Run at 10:00am Indian Standard time, everyday
  cronTime: "00 10 * * *",
  onTick: async function () {
    // Run whatever you like here..
    const reminderList = await pipForm.find({
      pipEndDate: getFormattedDate(addDays(new Date(), 3)),
    });
    console.log(reminderList);
    console.log(getFormattedDate(addDays(new Date(), 3)));
    reminderList.forEach(async (pipData) => {
      console.log(pipData.mentorMail);
      console.log(pipData.pipCreaterMail);
      var mailOptions = {
        from: "practeetechnology@gmail.com",
        to: pipData.mentorMail,
        // to: "ashutosh.das@practee.com",
        subject: "PIP - Deadline Reminder",
        html: reminderPipEmail(
          pipData.mentor,
          process.env.APP_URL + "/utility/pip-status-form/" + pipData._id,
          false
        ),
      };
      await mailer(mailOptions);
      var mailOptions = {
        from: "practeetechnology@gmail.com",
        to: pipData.pipCreaterMail,
        // to: "ash.exp@outlook.com",
        subject: "PIP - Deadline Reminder",
        html: reminderPipEmail(
          pipData.pipCreater,
          process.env.APP_URL + "/utility/pip-status-form/" + pipData._id,
          true
        ),
      };
      await mailer(mailOptions);
    });
  },
  start: true,
  timeZone: "Asia/Kolkata",
});

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getFormattedDate(date) {
  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;

  return month + "/" + day + "/" + year;
}

// Start Listenting for the server on PORT
const db = connection;

db.on("error", console.error.bind(console, "Error connecting to db"));

db.once("open", function () {
  success({
    message: `Successfully connected with the Database \n${DB}`,
    badge: true,
  });
}).then(() => {
  app.listen(PORT, () =>
    success({ message: `Server started on PORT ${PORT}`, badge: true })
  );
});
