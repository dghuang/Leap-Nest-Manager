const PORT = 3000;

/***********************************************************
 Modules
 ************************************************************/

var express = require('express');
var app = express();
var ejs = require('ejs');
var request = require('request');
var bodyParser = require('body-parser');


/***********************************************************
 Configuration
 ************************************************************/
// Private configuration
var privateConfig = require('./config.js')();

app.engine('html', ejs.renderFile);
app.use(express.static("./public"));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    extended: true
}));

/***********************************************************
 App Startup
 ************************************************************/

require('./app/routes/thermostatRoutes')(app, request, privateConfig);

var server = app.listen(PORT, function () {
    console.log("Server started successfully on port " + PORT + ".");
});