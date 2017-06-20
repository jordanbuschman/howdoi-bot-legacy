var express = require('express');
var path = require('path');

var checkHeaders = require('./middleware').checkHeaders;
var sendResponse = require('./sendResponse');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'skeletor.png'));
});

router.post('/message', checkHeaders, function(req, res, next) {
    if (!req.body.data) {
        return res.status(400).json({ 'status': 400, 'message': 'Missing message body' });
    }

    sendResponse(req.body.data.id, res.end.bind(res), next);
});

module.exports = router;
