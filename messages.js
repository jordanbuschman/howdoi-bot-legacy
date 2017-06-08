var request = require('request');
var jsdom = require('node-jsdom');
var google = require('google');
var markdown = require('to-markdown');
var async = require('async');
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
                async.eachSeries(links, function(link, callback){
                    jsdom.env(link, function(errs, window) {
                        if (errs) {
                            return callback(errs[0]);
                        } else {
                            var results = window.document.getElementsByClassName('ya-q-full-text');
                            console.log('Checking ' + link);
                            console.log(results.length);
                            if (results && results.length >= 2) {
                                console.log('Found result!');
                                var topResult = results[1].innerHTML;
                                return resolve({ roomId: roomId, text: topResult });
                            } else {
                                console.log('No result found for ' + link);
                                callback();
                            }
                        }
                    });
                }, function(err) {
                    return reject(err);
                });
                console.log('here');
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
