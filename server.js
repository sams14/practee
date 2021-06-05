const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoute = require('./Routes/routes');

dotenv.config();

//initialize express.
const app = express();


app.set('view engine', 'ejs');
//connect to db
mongoose.connect(
    process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true },
    () => console.log('connected to db')
);

// Initialize variables.
const port = 3000; // process.env.PORT || 3000;

// Configure morgan module to log all requests.
app.use(morgan('dev'));

// Set the front-end folder to serve public assets.
app.use(express.static(path.join(__dirname, 'JavaScriptSPA')));

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set route middleware
app.use('/', authRoute);

app.use('/', function(req, res) {
    res.render('index');
});


// zoom - vimeo integration
// const schedular = require('node-schedule');
// const job = schedular.scheduleJob('30 2 * * *', function(){
//     const { spawn } = require('child_process');
//     const childP = spawn('python', ['vimeo_uploader.py']);
//     childP.stdout.on('data', (data)=>{
//         console.log(`stdout: ${data}`);
//     });
//     childP.stderr.on('data', (data)=>{
//         console.log(`stderr: ${data}`);
//     });
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

// Start the server.
app.listen(port);
console.log('Listening on port ' + port + '...');