var spark = require('../lib/spark');

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

function aboutFunction(roomId, parameters, end) {
    spark.sendMessage(roomId, 'Beep boop, I am howdoi-bot, your spicy personal assistant. Ask me a question, or run a command (see all commands with `howdoi /help`).', function(err) {
        if (err) {
            throw err;
        } else {
            end();
        }
    });
}

function helpFunction(roomId, parameters, end) {
    var text = 'You can type any of the following commands:\n';
    for (key in commandList) {
        text += '* **\/' + key + '**';
        if ('parameters' in commandList[key] && commandList[key].parameters.length) {
            text += '_(';
            for (var i = 0; i < commandList[key].parameters.length-1; i++) {
                text += commandList[key].parameters[i] + ', ';
            }
            text += commandList[key].parameters[commandList[key].parameters.length-1] + ')_';
        }
        text += ': ' + commandList[key].description + '\n';
    }

    spark.sendMessage(roomId, text, function(err) {
        if (err) {
            throw err;
        } else {
            end();
        }
    });
}

function statusFunction(roomId, parameters, end) {
    var gifs = [
        'https://i.warosu.org/data/tg/img/0423/56/1441675331137.gif',
        'https://media.giphy.com/media/11ziErSEWbAlXi/giphy.gif',
        'https://media.tenor.com/images/b7a43f2a884a5469c505b3b0838b6aa2/tenor.gif'
    ];

    spark.sendImage(roomId, gifs[Math.floor(Math.random()*gifs.length)], function(err) {
        if (err) {
            throw err;
        } else {
            end();
        }
    });
}

var commandList = {
    'about': {
        'description': 'Get information about howdoi-bot.',
        'parameters': [],
        'function': aboutFunction
    },
    'help': {
        'description': 'Display this list.',
        'parameters': [],
        'function': helpFunction
    },
    'status': {
        'description': 'Get real-time status of howdoi-bot',
        'parameters': [],
        'function': statusFunction
    }
};

module.exports = {
    commandList: commandList,
    sendUnrecognizedCommand: sendUnrecognizedCommand
};
