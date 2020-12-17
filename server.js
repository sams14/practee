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

//set route middleware
app.use('/', authRoute);


// Start the server.
app.listen(port);
console.log('Listening on port ' + port + '...');