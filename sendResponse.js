var debug = require('debug')('howdoi-bot:send-response');

var spark = require('./spark');
var sendCommandResponse = require('./responses/sendCommandResponse');
var sendYAResponse = require('./responses/sendYAResponse');

function getText(messageId, callback) {
    debug('Getting input text...');

    spark.getMessage(messageId, function(err, roomId, text) {
        if (err) {
            callback(err);
        } else {
            var input = text.split('howdoi');
            var command = input[input.length-1].trim()
            callback(null, roomId, command);
        }
    });
}

module.exports = function(messageId, end, next) {
    getText(messageId, function(err, roomId, input) {
        if (err) {
            return next(err);
        }

        try {
            if (!input) {
                return end();
            } else if (input.charAt(0) === '/') {
                debug('Interpreting text as command.');
                sendCommandResponse(roomId, input.substring(1).split(' ')[0], end);
            } else {
                debug('Interpreting text as Yahoo Answers question.');
                sendYAResponse(roomId, input, end);
            }
        } catch(err) {
            next(err);
        }
    });
};
