const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const uuid = require('uuid').v4;
// const authRoute = require('./Routes/routes');
const cors = require("cors");
const passport = require("passport");
const axios = require('axios');
const { mailer } = require('./utils/password');
const { connect, connection } = require("mongoose");
const { success, error } = require("consola");

// Bring in the app constants
const { ENV, URL, DB, SECRET, PORT } = require("./config/index");

//initialize express.
const app = express();

//Serving ejs files in views folder
app.set('view engine', 'ejs');

// Configure morgan module to log all requests.
app.use(morgan('dev'));

// Secure Express app using Helmet Middlewares
// app.use(helmet());
app.use(helmet({contentSecurityPolicy : false}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Set the front-end folder to serve public assets.
app.use(express.static(path.join(__dirname, 'Public')));

app.use(cors());

app.use("/practee", require("./Routes/practee"));

// Connection With DB
connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},function (err) {
        if(err){
            error({
                message: `Unable to connect with Database \n${err}`,
                badge: true
            });
        }
    }
)

const sessionStore = new MongoStore({ 
    mongooseConnection: connection,
    collection: 'sessions' 
});

app.use(session({
    genid: (req) => {
        return uuid() // use UUIDs for session IDs
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        secure: ENV=="production" ? true : false,
        httpOnly: true,
        sameSite: true
    }
}));

// Middlewares
require("./middlewares/passport");
app.use(passport.initialize());
app.use(passport.session());

// User Router Middleware
app.use("/", require("./Routes/users"));
app.use("/api/v1", require("./Routes/api"));

app.get('*', function(req, res) {
    res.render('pages/404');
});

// app.use('/', authRoute);

// app.use('/', function(req, res) {
//     res.render('index');
// });


//Python Job Scheduler
const CronJob = require('cron').CronJob;
const { spawn } = require('child_process');
const job = new CronJob({
    // Run at 02:30am Indian Standard time, everyday
    cronTime: '30 02 * * *',
    onTick: function() {
        // Run whatever you like here..
        let json_response, error = 'No Error Found !!';
        const childP = spawn('python3.7', [path.resolve("Job Scheduler","vimeo_uploader.py")]);
        childP.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        childP.stderr.on('data', (data) => {
            error = data
        });
        childP.on('close', async (code) => {
            await axios({
                method: 'post',
                url: URL+'/practee/vimeo/folder/update'
            }).then(function(response) {
                // handle success
                json_response = response['data'];
                console.log(json_response);
            })
            .catch(function(err) {
                // handle error
                console.log(err);
            });
            console.log(`Job Scheduler error: ${error}`);
            console.log(`Job Scheduler exited with code: ${code}`);
            var mailOptions = {
                from: "ash2000test@gmail.com",
                to: "asutosh2000ad@gmail.com",
                cc: "sambidbharadwaj@gmail.com",
                subject: 'Job Scheduler Status',
                html: `
                <h3>Database Updation</h3>
                <p>Message: ${JSON.stringify(json_response['message'])}</p>
                <p>Failed Folders: ${JSON.stringify(json_response['failed_folders'])}</p>
                <p>Status: <strong>${JSON.stringify(json_response['success'])}</strong></p>
                <br>
                <h3>Job Scheduler</h3>
                <p>Job Scheduler Status: <strong>${error}</strong></p>
                <p>Job Scheduler Exited With Status Code: <strong>${code}</strong></p>
                `
                };
            await mailer(mailOptions);
        });
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

// Start Listenting for the server on PORT
const db = connection;

db.on('error', console.error.bind(console, "Error connecting to db"));

db.once('open', function(){
    success({
        message: `Successfully connected with the Database \n${DB}`,
        badge: true
    });
}).then(()=>{
    app.listen(PORT, () =>
        success({ message: `Server started on PORT ${PORT}`, badge: true })
    )
})