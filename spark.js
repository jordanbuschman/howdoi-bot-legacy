var request = require('request');

module.exports = {
    sendMessage: function(roomId, text, callback) {
        request({
            method: 'POST',
            uri: 'https://api.ciscospark.com/v1/messages',
            headers: {
                authorization: 'Bearer ' + process.env.ACCESS_TOKEN
            },
            form: {
                roomId: roomId,
                markdown: text
            }
        }, function(err, response, body) {
            if (err) {
                callback(err);
            } else {
                if (response.statusCode !== 200) {
                    callback(new Error(JSON.parse(body).message));
                } else {
                    callback();
                }
            }
        });
    },
    getMessage: function(messageId, callback) {
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
                var b = JSON.parse(body);
                if (response.statusCode !== 200) {
                    callback(new Error(b.message));
                } else {
                    callback(null, b.roomId, b.text);
                }
            }
        });
    }
};
