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
	localization: '',
	dist: './'
};

gulp.task('translate_backup', function() {
	return gulp.src(PATHS.localization + 'po/*.*')
		.pipe(gulp.dest(PATHS.localization + 'po/backup/'));
});

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

gulp.task('translate_clean', function() {
	del.sync([
		PATHS.localization + 'po/*.*'
	], {force: true});
});

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
			.pipe(gulp.dest(PATHS.localization + 'po/'));
});

var crypto = require('crypto');

gulp.task('translate_out', function() {
	runSequence(
		'translate_backup',
		'translate_clean',
		'translate_extract',
		function() {
			var newFile = PATHS.localization + 'po/template.pot';
			var oldFile = PATHS.localization + 'po/backup/template.pot';
			if (!fileCompare(newFile, oldFile)) return;

			var command = format('node {0} {1} {2}',
				[
					PATHS.localization + 'loco/export.js',
					'9eb87f16b36c24b37d2b767e8ce29a1a',
					PATHS.localization + 'po/template.pot'
				]);

			console.log(command);
			_exec(command);
		});
});


gulp.task('translate_in', function() {
	var locales = ['en-US', 'ru-RU']; // es_AR == es_419
	locales.forEach(function(locale, index) {
		var child = spawn('node',
			[
				PATHS.localization +'loco/import.js',
				'9eb87f16b36c24b37d2b767e8ce29a1a',
				PATHS.localization + 'po/',
				locale
			], {cwd: process.cwd()});

		child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
			console.log('data: ', data);
    });

		child.on('close', function(code) {
			console.log('language compile: ', locale);
			gulp.src(PATHS.localization + format('po/{0}.po', [locale]))
				.pipe(gettext.compile({
					format: 'json'
				}))
				.pipe(gulp.dest(PATHS.dist + '/languages/'));
		});

		// gulp.src('node_modules/angular-i18n/angular-locale_' + locale.toLowerCase().replace('_', '-') + '.js')
		// 	.pipe(gulp.dest(PATHS.dist +'/angular/i18n/'));
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
