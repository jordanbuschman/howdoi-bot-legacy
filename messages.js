var request = require('request');
var jsdom = require('node-jsdom');
var google = require('google');
var markdown = require('to-markdown');
var Promise = require('promise');

module.exports = {
    getText: function(params) {
        return new Promise(function(resolve, reject) {
            var messageId = params.messageId;

            request({
                method: 'GET',
                uri: 'https://api.ciscospark.com/v1/messages/' + messageId + '?mentionedPeople=me',
                headers: {
                    authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
                },
            }, function(err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    var b = JSON.parse(body);
                    if (response.statusCode !== 200) {
                        var e = new Error(b.message);
                        reject({ status: response.statusCode, message: e.message, stack: e.stack });
                    } else {
                        var input = b.text.split('howdoi')[1].trim()
                        resolve({ roomId: b.roomId, input: input });
                    }
                }
            });
        });
    },

    getQuestionLinks: function(params) {
        return new Promise(function(resolve, reject) {
            var roomId = params.roomId;
            var input = params.input;

            google(input + ' site:answers.yahoo.com/question', function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    if (res.links.length > 0) {
                        var hrefs = res.links.map(function(link) {
                            return link.href;
                        });
                        resolve({ roomId: roomId, links: hrefs });
                    } else {
                        resolve({ roomId: roomId, text: 'Beep boop, no results found.' });
                    }
                }
            });
        });
    },

    getYAResponse: function(params) {
        return new Promise(function(resolve, reject) {
            var roomId = params.roomId;
            var links = params.links;

            if (!links) {
                resolve(params);
            } else {
                for (link in links) {
                    jsdom.env(link, function(errs, window) {
                        if (errs) {
                            return reject(errs[0]);
                        } else {
                            var results = window.document.getElementsByClassName('ya-q-full-text');
                            if (results && results.length >= 2) {
                                var topResult = results[1].innerHTML;
                                return resolve({ roomId: roomId, text: result });
                            }
                        }
                    });
                }
                resolve({ roomId: roomId, text: 'Beep boop, no results found.' });
            }
        });
    },

    sendMessage: function(params) {
        return new Promise(function(resolve, reject) {
            var roomId = params.roomId;
            var text = params.text;
    
            request({
                method: 'POST',
                uri: 'https://api.ciscospark.com/v1/messages',
                headers: {
                    authorization: 'Bearer ' + process.env.ACCESS_TOKEN
                },
                form: {
                    roomId: roomId,
                    markdown: markdown(text)
                }
            }, function(err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    if (response.statusCode !== 200) {
                        var e = new Error(JSON.parse(body).message);
                        reject({ status: response.statusCode, message: e.message, stack: e.stack });
                    } else {
                        resolve();
                    }
                }
            });
        });
    }
};
