/*
 * basic ExpressJS server
 * @link http://expressjs.com/starter/static-files.html
 */

//requires
var favicon = require('serve-favicon');
var express = require('express');
var path = require('path');

//make our app.
var app = express();

// Favicons.
app.use(favicon(path.join(__dirname + '/dist/', '', 'favicon.ico')));
// Use dev directories.
app.use(express.static('lib'));
app.use(express.static('dist'));


//get anything
app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname + '/dist/' + req.path));
});


// Start serving.
console.log('server listening at port 4000');
app.listen(4000);
