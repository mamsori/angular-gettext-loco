var imp = require('./lib/import');

var key = process.argv[2];
var path = process.argv[3]; //'./src/po/';
var locale = process.argv[4];

imp(key, locale, path);

//locales.forEach(function(locale, index){
//  imp(key, locale, path);
//});