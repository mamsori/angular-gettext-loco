'use strict';
var request = require('request'),
    qs = require('querystring'),
    fs = require('fs'),
    merge = require('merge'),
    mkdirp = require('mkdirp'),
    Q = require('q');

var import_url = 'https://localise.biz/api/export/locale/';

var import_options = {
    status: 'translated',
    index: 'text'
};

module.exports = {
    import: function (key, filename, opt) {
        var deferred = Q.defer();

        if(opt) import_options = merge(import_options, opt);

        var _url = import_url + filename + '?' + qs.stringify(import_options);
        console.log(_url);

        request.get({
            url: _url,
            headers: { "Authorization": 'Loco ' + key }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                deferred.reject(error);
                return;
            }
            deferred.resolve(body);
            // fs.writeFileSync(path + fileName, body);
        });

        return deferred.promise;
    },
    export: function (key, file) {
        var deferred = Q.defer();

        fs.readFile(file, function (e, file_text) {
            if (e) {
                console.log(e);
                deferred.reject(e);
                return;
            }
            request.post({
                url: 'https://localise.biz/api/import/pot',
                headers: { "Authorization": 'Loco ' + key },
                body: file_text
            }, function (error, response, body) {
                console.log(body);
                if(error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(body);
                }
            });
        });
        return deferred.promise;
    }
};
