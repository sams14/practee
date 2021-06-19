const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const authRoute = require('./Routes/routes');
const cors = require("cors");
const passport = require("passport");
const { connect } = require("mongoose");
const { success, error } = require("consola");

// Bring in the app constants
const { DB, PORT } = require("./config/index");

//initialize express.
const app = express();

//Serving ejs files in views folder
app.set('view engine', 'ejs');

// Configure morgan module to log all requests.
app.use(morgan('dev'));

app.use(bodyParser.json());

// Set the front-end folder to serve public assets.
app.use(express.static(path.join(__dirname, 'JavaScriptSPA')));

// Middlewares
app.use(cors());
app.use(passport.initialize());

require("./middlewares/passport")(passport);

// User Router Middleware
app.use("/api/users", require("./routes/users"));

// app.use('/', authRoute);

// app.use('/', function(req, res) {
//     res.render('index');
// });

const CronJob = require('cron').CronJob;
const { spawn } = require('child_process');
const job = new CronJob({
    // Run at 05:00 Central time, only on weekdays
    cronTime: '30 02 * * *',
    onTick: function() {
        // Run whatever you like here..
        const childP = spawn('python3.7', ['vimeo_uploader.py']);
        childP.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        childP.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

const startApp = async() => {
    try {
        // Connection With DB
        await connect(DB, {
            useFindAndModify: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        success({
            message: `Successfully connected with the Database \n${DB}`,
            badge: true
        });

        // Start Listenting for the server on PORT
        app.listen(PORT, () =>
            success({ message: `Server started on PORT ${PORT}`, badge: true })
        );
    } catch (err) {
        error({
            message: `Unable to connect with Database \n${err}`,
            badge: true
        });
        startApp();
    }
};

startApp();