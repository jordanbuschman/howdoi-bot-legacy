var debug = require('debug')('howdoi-bot:send-response');

var request = require('request');

//var sendCommandResponse = require('./responses/sendCommandResponse');
var sendYAResponse = require('./responses/sendYAResponse');

function getText(messageId, callback) {
    debug('Getting input text...');

    request({
        method: 'GET',
        uri: 'https://api.ciscospark.com/v1/messages/' + messageId + '?mentionedPeople=me',
        headers: {
            authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
        },
    }, function(err, response, body) {
        if (err) {
            callback(err);
        } else {
            debug('Done.')

            var b = JSON.parse(body);
            if (response.statusCode !== 200) {
                callback(new Error(b.message));
            } else {
                var inputs = b.text.split('howdoi');
                var text = inputs[inputs.length-1].trim()
                callback(null, b.roomId, text);
            }
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
                end()
                //sendCommandResponse(roomId, input.substring(1).split(' ')[0], end);
            } else {
                debug('Interpreting text as Yahoo Answers question.');
                sendYAResponse(roomId, input, end);
            }
        } catch(err) {
            next(err);
        }
    });
};
