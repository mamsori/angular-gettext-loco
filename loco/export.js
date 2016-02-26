
var exp = require('./lib/export');

var key = process.argv[2];
var file = process.argv[3]; // || './src/po/template.pot';

exp(key, file);