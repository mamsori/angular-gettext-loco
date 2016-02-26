'use strict';
//var program = require('commander');
var request = require('request');
var fs = require('fs');

var url = 'https://localise.biz/api/import/pot';

module.exports = function (key, file) {
    fs.readFile(file, function (e, file_text) {
        if (e) {
            console.log(e);
            return;
        }
        request.post({
            url: url,
            headers: { "Authorization": 'Loco ' + key },
            body: file_text
        }, function (error, response, body) {
            console.log(body);
        });
    });
};