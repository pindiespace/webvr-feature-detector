var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var port = 4000;

// Create the Express server.
var app = express();

// favicon /public
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));

// make node_modules accessible
app.use(express.static(path.join(__dirname, 'node_modules')));

// make public directory accessible
app.use(express.static(path.join(__dirname, 'dist')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


if(!port) {
  port = process.env.PORT;
}

app.listen(port);
console.log('server running at port:' + port);

module.exports = app;
