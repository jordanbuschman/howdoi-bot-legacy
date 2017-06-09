var express = require('express');
var crypto = require('crypto');
var path = require('path');

var messages = require('./messages');

var router = express.Router();

function checkHeaders(req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    if (!req.header('X-Spark-Signature')) {
        return res.status(400).json({ 'status': 400, 'message': 'Missing Secret' });
    }

    var bodyHash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')
    if (bodyHash !== req.header('X-Spark-Signature')) {
        return res.status(400).json({ 'status': 400, 'message': 'Secrets don\'t match' });
    }

    next();
}

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'skeletor.png'));
});

router.post('/message', checkHeaders, function(req, res, next) {
    if (!req.body.data) {
        return res.status(400).json({ 'status': 400, 'message': 'Missing message body' });
    }

    messages.getText({ messageId: req.body.data.id })
        .then(messages.getQuestionLinks)
        .then(messages.getYAResponse)
        .then(messages.sendMessage)
        .then(res.end.bind(res))
        .catch(function(err) { return next(err); });
});

module.exports = router;
