var debug = require('debug')('howdoi-bot:send-command-response');

var commands = require('./../commands');

module.exports = function(roomId, input, end) {
    var words = input.split(' ');

    if (words[0] in commands.commandList) {
        commands.commandList[words[0]]['function'](roomId, words.shift(), end);
    } else {
        commands.sendUnrecognizedCommand(roomId, end);
    }
};
