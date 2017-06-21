var debug = require('debug')('howdoi-bot:send-command-response');
var spark = require('./../spark');

function sendUnrecognizedCommand(roomId, end) {
    var text = 'Unrecognized command. To see a list of supported commands, use the command `howdoi /help`.';

    spark.sendMessage(roomId, text, function(err) {
        if (err) {
            throw err;
        } else {
            end();
        }
    });
}

module.exports = function(roomId, input, end) {
    switch(input) {
        default:
            sendUnrecognizedCommand(roomId, end); 
    }
    end();
};
