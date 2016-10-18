var fs = require('fs'),
		path = require('path'),
		del = require('del'),
		gulp = require('gulp'),
		gettext = require('gulp-angular-gettext'),
		_exec = require('child_process').exec,
		spawn = require('child_process').spawn,
		format = require("string-template"),
		foreach = require('gulp-foreach'),
		runSequence = require('run-sequence');

var PATHS = {
	build: './build/',
	dist: './languages/'
};

gulp.task('translate_backup', function() {
	return gulp.src(PATHS.build + 'template.pot')
		.pipe(gulp.dest(PATHS.build + 'template_backup.pot'));
});

var crypto = require('crypto');
var fileCompare = function(newFile, oldFile) {
	if(!fs.existsSync(newFile)) return false;
	if(fs.existsSync(oldFile)) {
		var shasum = crypto.createHash('sha1');
		newFile = fs.readFileSync(newFile, 'utf8');
		oldFile = fs.readFileSync(oldFile, 'utf8');
		shasum.update(newFile);
		var newHex = shasum.digest('hex');
		shasum = crypto.createHash('sha1');
		shasum.update(oldFile);
		var oldHex = shasum.digest('hex');
		console.log(newHex, oldHex);
		if(newHex === oldHex) return false;
	}
	return true;
};

gulp.task('translate_extract', function () {
    return gulp.src([
				'*.html'
			])
			.pipe(gettext.extract('template.pot', {
			        extensions: {
			            html: 'html',
                  js: 'js'
			        }
			    }))
			.pipe(gulp.dest(PATHS.build ));
});


var loco = require('./build/loco-client.js'),
	Q = require('q'),
	merge = require('merge');

gulp.task('translate_out', function() {
	runSequence(
		'translate_backup',
		'translate_extract',
		function() {
			var newFile = PATHS.build + 'template.pot';
			var oldFile = PATHS.build + 'template_backup.pot';
			if (!fileCompare(newFile, oldFile)) return;

			loco.export('9eb87f16b36c24b37d2b767e8ce29a1a', PATHS.build + 'template.pot')
				.then(function(d) {
					// console.log('translate_out succeed: ', d);
				}, function(d) {
					console.log('translate_out failed: ', d);
				});
		});
});


gulp.task('translate_in', function() {
	var locales = ['en-US', 'ru-RU']; // es_AR == es_419
	locales.forEach(function(locale, index) {
		console.log('importing from loco : ', locale);
		var locale_filename = locale + '.json';
		Q.all([
				loco.import('9eb87f16b36c24b37d2b767e8ce29a1a', locale_filename, {index: 'text'}),
				loco.import('ff25e896b523b33e28c2115ea398f6af', locale_filename, {index: 'name'})  // for server side error code
			]).then(function(d) {
				// console.log(d[0], d[1]);
				var str = '{"' + locale + '": ' + d[0].slice(0, -2) + ', ' + d[1].substr(1) + '}';
				// var data = {};
				// data[locale] = merge(d[0], d[1]);
				fs.writeFileSync(PATHS.dist + locale_filename, str);
			});

	});
});

var webserver = require('gulp-webserver');

gulp.task('play', function() {
	gulp.src('./')
		.pipe(webserver({
      livereload: true,
      open: true
		}));
});

gulp.task('default', ['translate_out', 'translate_in', 'play']);
