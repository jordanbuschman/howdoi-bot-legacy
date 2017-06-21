var debug = require('debug')('howdoi-bot:send-ya-response');

var async = require('async');
var google = require('google');
var jsdom = require('node-jsdom');
var markdown = require('to-markdown');
var Promise = require('promise');

var spark = require('./../spark');

function getQuestionLinks(params) {
    return new Promise(function(resolve, reject) {
        debug('Getting question links for query...');

        var roomId = params.roomId;
        var input = params.input;

        google('how do I ' + input + ' site:answers.yahoo.com/question', function(err, res) {
            debug('Done.');

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
}

function getYAResponse(params) {
    return new Promise(function(resolve, reject) {
        var roomId = params.roomId;
        var links = params.links;

        if (!links) {
            resolve(params);
        } else {
            async.eachSeries(links, function(link, callback){
                debug('Checking link for answer...');

                jsdom.env(link, function(errs, window) {
                    if (errs) {
                        return reject(errs[0]);
                    } else {
                        var results = window.document.getElementsByClassName('ya-q-full-text');
                        var title = window.document.getElementsByClassName('Fz-24')[0];
                        var hasEllipses = window.document.querySelectorAll('.Fz-13.Fw-n.Mb-10 .ya-q-full-text').length;
                        var responsePhrase = '_Say no more fam, I know exactly what you want to ask:_'

                        if (results && hasEllipses && results.length >= 2) {
                            debug('Done.');

                            var topResult = results[1].innerHTML;
                            var titleMD = responsePhrase + ' **"' + title.textContent.trim() + '"**';
                            return resolve({ roomId: roomId, title: titleMD, text: markdown(topResult) });
                        } else if (results && !hasEllipses && results.length >= 1) {
                            debug('Done.');

                            var topResult = results[0].innerHTML;
                            var titleMD = responsePhrase + ' **"' + title.textContent.trim() + '"**';
                            return resolve({ roomId: roomId, title: titleMD, text: markdown(topResult) });
                        }
                    }
                });
            }, function() {
                debug('No results found.');

                resolve({ roomId: roomId, text: 'Beep boop, no results found.' });
            });
        }
    });
}

function sendYAMessage(params) {
    return new Promise(function(resolve, reject) {
        debug('Sending answer to Spark...');

        var roomId = params.roomId;
        var title = params.title;
        var text = params.text;

        var body = (title ? title : '') + '\n\n---\n' + text + '\n\n---\n\n';

        spark.sendMessage(roomId, body, function(err) {
            if (err) {
                reject(err);
            } else {
                debug('Done.');

                resolve();
            }
        });
    });
}

module.exports = function(roomId, input, end) {
    getQuestionLinks({ roomId: roomId, input: input })
        .then(getYAResponse)
        .then(sendYAMessage)
        .then(end)
        .catch(function(err) {
            throw err;
        });
};
