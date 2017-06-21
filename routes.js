var debug = require('debug')('howdoi-bot:routes');

var express = require('express');
var path = require('path');

var checkHeaders = require('./middleware').checkHeaders;
var sendResponse = require('./sendResponse');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'skeletor.png'));
});

router.post('/message', checkHeaders, function(req, res, next) {
    debug('Got message.');

    if (!req.body.data) {
        return res.status(400).json({ 'status': 400, 'message': 'Missing message body' });
    }

    try {
        sendResponse(req.body.data.id, res.end.bind(res));
    } catch(err) {
        next(err);
    }
});

module.exports = router;
