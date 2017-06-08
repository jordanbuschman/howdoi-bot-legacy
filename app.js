var express = require('express');
var bodyParser = require('body-parser');

require('dotenv').config();

var index = require('./routes');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', index);

// catch 404
app.use(function(req, res, next) {
    res.status(404).json({ status: 404, message: 'Not found' });
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    var message = err.message;
    var error = req.app.get('env') === 'development' ? err : {};

    console.error({ message: message, status: error.status, stack: error.stack });

    // render the error page
    res.status(err.status || 500);
    res.json({ message: message, status: error.status, stack: error.stack });
});

module.exports = app;
