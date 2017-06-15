var request = require('request');
var jsdom = require('node-jsdom');
var google = require('google');
var markdown = require('to-markdown');
var async = require('async');
var debug = require('debug')('howdoi-bot:messaging');
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

            google('how do I ' + input + ' site:answers.yahoo.com/question', function(err, res) {
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
                            return reject(errs[0]);
                        } else {
                            var results = window.document.getElementsByClassName('ya-q-full-text');
                            var title = window.document.getElementsByClassName('Fz-24')[0];
                            var hasEllipses = window.document.querySelectorAll('.Fz-13.Fw-n.Mb-10 .ya-q-full-text').length;
                            var responsePhrase = '_Say no more fam, I know exactly what you want to ask:_'

                            if (results && hasEllipses && results.length >= 2) {
                                var topResult = results[1].innerHTML;
                                var titleMD = responsePhrase + ' **"' + title.textContent.trim() + '"**';
                                return resolve({ roomId: roomId, title: titleMD, text: markdown(topResult) });
                            } else if (results && !hasEllipses && results.length >= 1) {
                                var topResult = results[0].innerHTML;
                                var titleMD = responsePhrase + ' **"' + title.textContent.trim() + '"**';
                                return resolve({ roomId: roomId, title: titleMD, text: markdown(topResult) });
                            } else {
                                callback();
                            }
                        }
                    });
                }, function() {
                    resolve({ roomId: roomId, text: 'Beep boop, no results found.' });
                });
            }
        });
    },

    sendMessage: function(params) {
        return new Promise(function(resolve, reject) {
            var roomId = params.roomId;
            var title = params.title;
            var text = params.text;

            var body = (title ? title : '') + '\n\n---\n' + text + '\n\n---\n\n';
    
            request({
                method: 'POST',
                uri: 'https://api.ciscospark.com/v1/messages',
                headers: {
                    authorization: 'Bearer ' + process.env.ACCESS_TOKEN
                },
                form: {
                    roomId: roomId,
                    markdown: body
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
