'use strict';
var request = require('request');
var util = require('util');
var fs = require('fs');
var mkdirp = require('mkdirp');

var url = 'https://localise.biz/api/export/locale/%s?status=translated';

module.exports = function (key, locale, path) {
    var fileName = locale + '.po';

    mkdirp(path, function (err) {
        if (err) console.log(err);
    });
    request.get({
        url: util.format(url, fileName),
        headers: { "Authorization": 'Loco ' + key }
    }, function (error, response, body) {
        if (error) { console.log(error); return; }
        fs.writeFileSync(path + fileName, body);
    });
}
