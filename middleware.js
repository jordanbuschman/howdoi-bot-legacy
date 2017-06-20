var debug = require('debug')('howdoi-bot:middleware');

var crypto = require('crypto');

module.exports = {
    checkHeaders: function(req, res, next) {
        debug('Checking headers...');

        if (process.env.NODE_ENV === 'development') {
            debug('Dev environment, skipping...');

            return next();
        }
    
        if (!req.header('X-Spark-Signature')) {
            return res.status(400).json({ 'status': 400, 'message': 'Missing Secret' });
        }
    
        var bodyHash = crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')
        if (bodyHash !== req.header('X-Spark-Signature')) {
            return res.status(400).json({ 'status': 400, 'message': 'Secrets don\'t match' });
        }
    
        debug('Done.');
        next();
    }
};
