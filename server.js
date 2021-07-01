const express = require('express');
const session = require('express-session')
// const FileStore = require('session-file-store')(session);
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const uuid = require('uuid').v4;
// const authRoute = require('./Routes/routes');
const cors = require("cors");
const passport = require("passport");
const { connect, connection } = require("mongoose");
const { success, error } = require("consola");

// Bring in the app constants
const { ENV, DB, SECRET, PORT } = require("./config/index");

//initialize express.
const app = express();

//Serving ejs files in views folder
app.set('view engine', 'ejs');

// Configure morgan module to log all requests.
app.use(morgan('dev'));

//Secure Express app using Helmet Middlewares
app.use(helmet({contentSecurityPolicy : false}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Set the front-end folder to serve public assets.
app.use(express.static(path.join(__dirname, 'Public')));

app.use(cors());

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
app.use("/practee", require("./routes/practee"));
app.use("/api/v1", require("./Routes/api"));

app.get('/forgotPassword', function(req, res) {
    res.sendFile(path.join(__dirname, './Public/pages', 'forgot-password.html'));
});

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
        const childP = spawn('python3.7', [path.resolve("Job Scheduler","vimeo_uploader.py")]);
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